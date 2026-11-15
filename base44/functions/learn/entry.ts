import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import Stripe from 'npm:stripe@17.0.0';
import { secrets } from 'base44:runtime';
import { getOrNull, hasAccess, isPaid, rows } from '../../shared/learn.ts';

// Learner API for the Academy. Course and book content is only ever read here,
// after the signed-in member's access has been checked.
const SIGN_SECONDS = 7200;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { action, offering_id, lesson_id } = body;
    const db = base44.asServiceRole.entities;
    const admin = user.role === 'admin';
    const live = (r) => (admin ? r.status !== 'archived' : r.status === 'published');

    const sign = async (uri) =>
      uri ? (await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: SIGN_SECONDS })).signed_url : '';
    const media = async (url, uri) => ({ url: uri ? '' : (url || ''), src: await sign(uri) });
    const resources = (list) =>
      Promise.all((list || []).filter((r) => r && (r.url || r.file_uri)).map(async (r) => ({
        title: r.title || r.file_name || 'Resource',
        kind: r.file_uri ? 'file' : 'link',
        url: r.file_uri ? await sign(r.file_uri) : r.url,
      })));
    const card = (o, access) => ({
      id: o.id, kind: o.kind, title: o.title, subtitle: o.subtitle || '', author: o.author || '',
      thumbnail_url: o.thumbnail_url || '', is_free: !isPaid(o), price_cents: o.price_cents || 0,
      currency: o.currency || 'usd', status: o.status, has_access: access,
    });

    if (action === 'catalog') {
      const [published, ents, progress] = await Promise.all([
        db.LearnOffering.filter({ status: 'published' }, 'sort_order', 200),
        db.LearnEntitlement.filter({ user_id: user.id, status: 'active' }, '-created_date', 500),
        db.LearnProgress.aggregate({ query: { user_id: user.id }, groupBy: 'offering_id' }),
      ]);
      const owned = new Set(rows(ents).map((e) => e.offering_id));
      const list = rows(published);
      const missing = [...owned].filter((id) => !list.some((o) => o.id === id));
      if (missing.length) list.push(...rows(await db.LearnOffering.filter({ id: { $in: missing }, status: 'archived' })));
      const ids = list.map((o) => o.id);
      const counts = ids.length
        ? await db.LearnLesson.aggregate({ query: { offering_id: { $in: ids }, status: 'published' }, groupBy: 'offering_id' })
        : { rows: [] };
      const lessonCount = Object.fromEntries((counts.rows || []).map((r) => [r.offering_id, r.count]));
      const doneCount = Object.fromEntries((progress.rows || []).map((r) => [r.offering_id, r.count]));
      return Response.json({
        offerings: list.map((o) => ({
          ...card(o, admin || owned.has(o.id)),
          lesson_count: lessonCount[o.id] || 0,
          completed_count: Math.min(doneCount[o.id] || 0, lessonCount[o.id] || 0),
        })),
      });
    }

    if (!offering_id) return Response.json({ error: 'offering_id is required' }, { status: 400 });
    const offering = await getOrNull(db.LearnOffering, offering_id);
    const access = offering ? await hasAccess(db, user, offering_id) : false;
    // Archived offerings stay readable for the people who already own them.
    if (!offering || !(live(offering) || (offering.status === 'archived' && access))) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (action === 'offering') {
      const [mods, lessons, done] = await Promise.all([
        db.LearnModule.filter({ offering_id }, 'sort_order', 500),
        db.LearnLesson.filter({ offering_id }, 'sort_order', 1000),
        db.LearnProgress.filter({ user_id: user.id, offering_id }, '-created_date', 1000),
      ]);
      const doneIds = new Set(rows(done).map((p) => p.lesson_id));
      const shape = (l) => ({
        id: l.id, title: l.title, status: l.status,
        has_video: !!(l.video_url || l.video_file_uri), has_audio: !!(l.audio_url || l.audio_file_uri),
        has_worksheet: !!(l.worksheet?.questions || []).length, completed: doneIds.has(l.id),
      });
      const visible = rows(lessons).filter(live);
      const groups = [
        { id: '', title: '', description: '', lessons: visible.filter((l) => !l.module_id).map(shape) },
        ...rows(mods).filter(live).map((m) => ({
          id: m.id, title: m.title, description: m.description || '', status: m.status,
          lessons: visible.filter((l) => l.module_id === m.id).map(shape),
        })),
      ].filter((g) => g.lessons.length);
      return Response.json({
        offering: {
          ...card(offering, access),
          description: offering.description || '',
          purchasable: offering.status === 'published',
          video: await media(offering.video_url, offering.video_file_uri),
          embed_code: access ? (offering.embed_code || '') : '',
          resources: access ? await resources(offering.resources) : [],
        },
        groups,
      });
    }

    if (action === 'enroll') {
      if (offering.status !== 'published' || isPaid(offering)) return Response.json({ error: 'This is not a free offering.' }, { status: 400 });
      if (!access) {
        await db.LearnEntitlement.create({ offering_id, user_id: user.id, user_email: user.email, status: 'active', source: 'free' });
      }
      return Response.json({ has_access: true });
    }

    if (action === 'checkout') {
      if (access) return Response.json({ has_access: true });
      if (offering.status !== 'published' || !isPaid(offering) || !offering.stripe_price_id || offering.stripe_price_cents !== offering.price_cents) {
        return Response.json({ error: 'This offering is not available for purchase yet.' }, { status: 400 });
      }
      const origin = req.headers.get('X-Base44-App-Url');
      if (!origin) return Response.json({ error: 'Checkout is unavailable right now.' }, { status: 500 });
      const base = origin.replace(/\/$/, '');
      const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: offering.stripe_price_id, quantity: 1 }],
        customer_email: user.email,
        client_reference_id: user.id,
        success_url: `${base}/learn/${offering_id}?purchase=success`,
        cancel_url: `${base}/learn/${offering_id}`,
        metadata: {
          base44_app_id: secrets.get('BASE44_APP_ID'),
          payment_type: 'learn_offering',
          learn_offering_id: offering_id,
          learn_user_id: user.id,
        },
      });
      await db.LearnEntitlement.create({
        offering_id, user_id: user.id, user_email: user.email, status: 'pending', source: 'purchase',
        stripe_session_id: session.id, expected_amount_cents: offering.price_cents, currency: offering.currency || 'usd',
      });
      console.log(`Academy checkout created: ${session.id} for offering ${offering_id}`);
      return Response.json({ url: session.url });
    }

    // Everything below reads or writes lesson content, so access is required.
    if (!access) return Response.json({ error: 'You do not have access to this yet.' }, { status: 403 });
    if (!lesson_id) return Response.json({ error: 'lesson_id is required' }, { status: 400 });
    const lesson = await getOrNull(db.LearnLesson, lesson_id);
    if (!lesson || lesson.offering_id !== offering_id || !live(lesson)) return Response.json({ error: 'Not found' }, { status: 404 });

    if (action === 'lesson') {
      const [mod, done, saved] = await Promise.all([
        lesson.module_id ? getOrNull(db.LearnModule, lesson.module_id) : null,
        db.LearnProgress.filter({ user_id: user.id, lesson_id }, '-created_date', 1),
        db.LearnWorksheetAnswer.filter({ user_id: user.id, lesson_id }, '-created_date', 1),
      ]);
      if (mod && !live(mod)) return Response.json({ error: 'Not found' }, { status: 404 });
      const questions = (lesson.worksheet?.questions || []).filter((q) => q.id && q.label);
      return Response.json({
        lesson: {
          id: lesson.id, title: lesson.title, subtitle: lesson.subtitle || '', body: lesson.body || '',
          status: lesson.status, module_title: mod?.title || '',
          video: await media(lesson.video_url, lesson.video_file_uri),
          audio: await media(lesson.audio_url, lesson.audio_file_uri),
          poster: lesson.thumbnail_url || '',
          embed_code: lesson.embed_code || '',
          resources: await resources(lesson.resources),
          module_resources: mod ? await resources(mod.resources) : [],
          worksheet: questions.length ? { ...lesson.worksheet, questions } : null,
          answers: rows(saved)[0]?.answers || {},
          completed: rows(done).length > 0,
        },
      });
    }

    if (action === 'complete') {
      const existing = rows(await db.LearnProgress.filter({ user_id: user.id, lesson_id }, '-created_date', 5));
      if (body.completed && !existing.length) await db.LearnProgress.create({ user_id: user.id, offering_id, lesson_id });
      if (!body.completed && existing.length) await db.LearnProgress.deleteMany({ user_id: user.id, lesson_id });
      return Response.json({ completed: !!body.completed });
    }

    if (action === 'saveAnswers') {
      const allowed = new Set((lesson.worksheet?.questions || []).map((q) => q.id));
      const answers = Object.fromEntries(
        Object.entries(body.answers || {})
          .filter(([k, v]) => allowed.has(k) && typeof v === 'string')
          .map(([k, v]) => [k, v.slice(0, 8000)]),
      );
      const existing = rows(await db.LearnWorksheetAnswer.filter({ user_id: user.id, lesson_id }, '-created_date', 1))[0];
      if (existing) await db.LearnWorksheetAnswer.update(existing.id, { answers });
      else await db.LearnWorksheetAnswer.create({ user_id: user.id, offering_id, lesson_id, answers });
      return Response.json({ saved: true });
    }

    return Response.json({ error: 'Unknown request' }, { status: 400 });
  } catch (error) {
    console.error('learn error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}