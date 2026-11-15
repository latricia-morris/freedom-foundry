import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import Stripe from 'npm:stripe@17.0.0';
import { secrets } from 'base44:runtime';
import { getOrNull, isPaid, rows, syncOfferingToStripe } from '../../shared/learn.ts';

// Admin-only: keeps Stripe in step with an offering, and removes offerings safely.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { action, offering_id } = await req.json().catch(() => ({}));
    if (!['sync', 'remove'].includes(action) || !offering_id) return Response.json({ error: 'Unknown request' }, { status: 400 });

    const db = base44.asServiceRole.entities;
    const offering = await getOrNull(db.LearnOffering, offering_id);
    if (!offering) return Response.json({ error: 'Not found' }, { status: 404 });
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
    const appId = secrets.get('BASE44_APP_ID');

    if (action === 'sync') {
      if (isPaid(offering) && (!Number.isInteger(offering.price_cents) || offering.price_cents < 50)) {
        return Response.json({ error: 'A paid price must be at least $0.50.' }, { status: 400 });
      }
      const updated = await syncOfferingToStripe(stripe, db, offering, appId);
      return Response.json({ offering: updated });
    }

    // remove: anything people already own is archived instead of deleted.
    const owners = await db.LearnEntitlement.count({ offering_id, status: 'active' });
    if (owners > 0) {
      const archived = await db.LearnOffering.update(offering_id, { status: 'archived' });
      await syncOfferingToStripe(stripe, db, archived, appId);
      return Response.json({ archived: true, owners });
    }
    if (offering.stripe_product_id) await stripe.products.update(offering.stripe_product_id, { active: false });
    await Promise.all([
      db.LearnLesson.deleteMany({ offering_id }),
      db.LearnModule.deleteMany({ offering_id }),
      db.LearnEntitlement.deleteMany({ offering_id }),
    ]);
    await db.LearnOffering.delete(offering_id);
    return Response.json({ deleted: true });
  } catch (error) {
    console.error('learnAdmin error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}