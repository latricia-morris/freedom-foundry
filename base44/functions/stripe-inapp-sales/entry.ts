import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import Stripe from 'npm:stripe@17.0.0';
import { secrets } from 'base44:runtime';

// In-app product sales from Stripe — pull only. Lists products with their
// default price, finds every paid checkout session, groups purchases per
// product, and joins purchaser emails to app members with their lesson
// completion so product usage can be monitored. Admin-only.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole;
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));

    // ── Products (created later appear here automatically) ──
    const productMap = new Map();
    for await (const p of stripe.products.list({ limit: 100, expand: ['data.default_price'] })) {
      productMap.set(p.id, {
        id: p.id,
        name: p.name,
        description: p.description || '',
        active: p.active,
        price_cents: p.default_price && p.default_price.unit_amount != null ? p.default_price.unit_amount : null,
        currency: (p.default_price && p.default_price.currency) || 'usd',
        purchases: 0,
        revenue_cents: 0,
        purchasers: [],
      });
    }

    // ── Paid checkout sessions (most recent 200) ──
    const sessions = [];
    for await (const s of stripe.checkout.sessions.list({ limit: 100 })) {
      if (s.payment_status === 'paid') sessions.push(s);
      if (sessions.length >= 200) break;
    }

    // ── Member usage: lesson completion by user ──
    const users = (await svc.entities.User.list('-created_date', 500).catch(() => [])) || [];
    const userByEmail = new Map(users.map((u) => [(u.email || '').toLowerCase(), u]));
    const progressRows = (await svc.entities.LessonProgress.filter({}, '-created_date', 1000).catch(() => [])) || [];
    const lessonsByUser = new Map();
    for (const row of progressRows) {
      const uid = row.created_by_id || row.user_id;
      if (!uid) continue;
      const entry = lessonsByUser.get(uid) || { count: 0, last: null };
      entry.count += 1;
      const stamp = row.completed_at || row.updated_date || row.created_date;
      if (stamp && (!entry.last || stamp > entry.last)) entry.last = stamp;
      lessonsByUser.set(uid, entry);
    }

    // ── Group purchases per product ──
    for (const s of sessions) {
      const lineItems = await stripe.checkout.sessions
        .listLineItems(s.id, { limit: 20 })
        .catch(() => ({ data: [] }));
      const email = ((s.customer_details && s.customer_details.email) || '').toLowerCase();
      const appUser = userByEmail.get(email) || null;
      const usage = appUser ? lessonsByUser.get(appUser.id) : null;
      for (const item of lineItems.data || []) {
        const productId = item.price && item.price.product ? String(item.price.product) : null;
        if (!productId) continue;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            id: productId,
            name: (item.description || 'Product').slice(0, 80),
            description: '',
            active: true,
            price_cents: null,
            currency: s.currency || 'usd',
            purchases: 0,
            revenue_cents: 0,
            purchasers: [],
          });
        }
        const entry = productMap.get(productId);
        entry.purchases += 1;
        entry.revenue_cents += item.amount_total != null ? item.amount_total : 0;
        if (email) {
          entry.purchasers.push({
            email,
            name: (s.customer_details && s.customer_details.name) || '',
            amount_cents: item.amount_total != null ? item.amount_total : 0,
            currency: s.currency || 'usd',
            date: s.created ? new Date(s.created * 1000).toISOString() : null,
            is_member: Boolean(appUser),
            lessons_completed: usage ? usage.count : 0,
            last_lesson_at: usage ? usage.last : null,
          });
        }
      }
    }

    const products = [...productMap.values()].map((p) => ({
      ...p,
      purchasers: p.purchasers.sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
    }));

    const totals = products.reduce(
      (acc, p) => ({
        revenue_cents: acc.revenue_cents + p.revenue_cents,
        purchases: acc.purchases + p.purchases,
      }),
      { revenue_cents: 0, purchases: 0 }
    );

    return Response.json({ products, totals, synced_at: new Date().toISOString() });
  } catch (error) {
    console.error('stripe-inapp-sales failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}