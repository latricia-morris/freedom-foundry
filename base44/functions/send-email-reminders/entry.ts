import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { resendConfigured } from '../../shared/email/config.ts';
import { sendTaskReminderEmail, sendChecklistReminderEmail } from '../../shared/email/service.ts';

// Daily reminder sweep, invoked by the "Daily Brand Reminders" workflow:
//   1. Pending Ignite OS action items on active records
//   2. Personal Checklist tasks due today, within 3 days, or overdue
// Auth: authenticated non-admins are rejected; scheduled workflow runs arrive
// without a user, and a same-day idempotency check makes any duplicate or
// abusive run a no-op (each user/record is emailed at most once per day).

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!resendConfigured()) {
      return Response.json({ skipped: 'Resend API key not configured — no reminders sent.' });
    }

    // ── Idempotency: reminder keys already sent today ──
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const logsToday = await service.entities.EmailLog.filter({ created_date: { $gte: dayStart.toISOString() } }).catch(() => []);
    const sentToday = new Set(
      (logsToday || [])
        .filter((log) => log.template_key === 'ignite_task_reminder' || log.template_key === 'checklist_reminder')
        .map((log) => `${log.template_key}:${log.related_id}`)
    );

    const summary = { igniteSent: 0, checklistSent: 0, skippedToday: 0, skippedNoEmail: 0, failed: 0 };
    const plan = [];

    // ── Resolve recipient emails / first names (cached per user) ──
    const emailCache = new Map();
    const nameCache = new Map();
    async function emailFor(userId) {
      if (!userId) return '';
      if (emailCache.has(userId)) return emailCache.get(userId);
      let email = '';
      try {
        const owner = await service.entities.User.get(userId);
        email = (owner && owner.email) || '';
      } catch (_) { /* user may be missing */ }
      emailCache.set(userId, email);
      return email;
    }
    async function firstNameFor(userId, email) {
      const fallback = (email || '').split('@')[0] || 'there';
      if (!userId) return fallback;
      if (nameCache.has(userId)) return nameCache.get(userId);
      let name = '';
      try {
        const profiles = await service.entities.UserProfile.filter({ user_id: userId }, '-updated_date', 1);
        name = (profiles?.[0] && profiles[0].first_name) || '';
      } catch (_) { /* profile optional */ }
      nameCache.set(userId, name || fallback);
      return nameCache.get(userId);
    }

    // ── 1. Ignite OS pending action items ──
    const igniteRecords = await service.entities.IgniteOS.filter({ status: 'active' }, '-created_date', 200).catch(() => []);
    for (const record of igniteRecords || []) {
      const pending = (record.action_items || [])
        .filter((item) => item && !item.done && String(item.text || '').trim())
        .map((item) => String(item.text).trim());
      if (!pending.length) continue;
      if (sentToday.has(`ignite_task_reminder:${record.id}`)) { summary.skippedToday += 1; continue; }

      const ownerId = record.user_id || record.created_by_id;
      const email = await emailFor(ownerId);
      if (!email) { summary.skippedNoEmail += 1; continue; }
      const firstName = await firstNameFor(ownerId, email);

      if (dryRun) {
        plan.push({ template: 'ignite_task_reminder', to: email, tasks: pending.length });
        continue;
      }
      const result = await sendTaskReminderEmail(service, {
        to: email,
        firstName,
        tasks: pending,
        phase: record.phase || '',
        relatedId: record.id,
        userId: ownerId,
      });
      if (result.ok) summary.igniteSent += 1; else { summary.failed += 1; console.error('ignite reminder failed:', result.error); }
    }

    // ── 2. Checklist tasks (due today, within 3 days, or overdue) ──
    const today = todayKey();
    const horizon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const openTasks = [];
    for (const status of ['pending', 'in_progress']) {
      const rows = await service.entities.ChecklistTask.filter({ status }, 'deadline_date', 500).catch(() => []);
      openTasks.push(...(rows || []));
    }
    for (const task of openTasks) {
      if (!task.deadline_date || task.deadline_date > horizon) continue;
      if (sentToday.has(`checklist_reminder:${task.id}`)) { summary.skippedToday += 1; continue; }

      const ownerId = task.user_id || task.created_by_id;
      const email = await emailFor(ownerId);
      if (!email) { summary.skippedNoEmail += 1; continue; }
      const firstName = await firstNameFor(ownerId, email);

      if (dryRun) {
        plan.push({ template: 'checklist_reminder', to: email, task: task.title, due: task.deadline_date });
        continue;
      }
      const result = await sendChecklistReminderEmail(service, {
        to: email,
        firstName,
        taskTitle: task.title,
        dueDate: task.deadline_date,
        overdue: task.deadline_date < today,
        relatedId: task.id,
        userId: ownerId,
      });
      if (result.ok) summary.checklistSent += 1; else { summary.failed += 1; console.error('checklist reminder failed:', result.error); }
    }

    return Response.json({ ok: true, date: today, dryRun, ...(dryRun ? { plan } : summary) });
  } catch (error) {
    console.error('send-email-reminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}