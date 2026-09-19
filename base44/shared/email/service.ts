import { Resend } from 'npm:resend@4.0.0';
import { renderTemplate } from './templates.ts';
import { resendApiKey, EMAIL_FROM, SUPPORT_FROM, ADMIN_INBOX } from './config.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable email service layer. Every send goes through sendTransactionalEmail,
// which renders the branded template, logs the attempt to EmailLog, sends via
// the Resend SDK, and records the Resend message id + status back on the log.
//
// `base44` is a Base44 SDK scope (usually `base44.asServiceRole`) used for
// logging. None of these functions throw — they return { ok, error, ... } so
// callers never break because an email failed.
// ─────────────────────────────────────────────────────────────────────────────

export async function sendTransactionalEmail(base44, options) {
  const {
    to,
    templateKey,
    templateData = {},
    from = '',
    replyTo = '',
    relatedEntity = '',
    relatedId = '',
    userId = '',
  } = options || {};

  const template = renderTemplate(templateKey, templateData);
  if (!template) return { ok: false, error: `Unknown email template: ${templateKey}` };
  const apiKey = resendApiKey();
  if (!apiKey) return { ok: false, error: 'Resend is not configured — set the RESEND_API_KEY secret.' };
  if (!to || !String(to).includes('@')) return { ok: false, error: 'A valid recipient email is required.' };

  let logId = '';
  try {
    const log = await base44.entities.EmailLog.create({
      to,
      subject: template.subject,
      template_key: templateKey,
      channel: 'resend',
      status: 'queued',
      payload: templateData,
      related_entity: relatedEntity,
      related_id: relatedId,
      user_id: userId,
    });
    logId = log?.id || '';
  } catch (error) {
    console.error(`email log create failed [${templateKey}]:`, error.message);
  }

  try {
    const resend = new Resend(apiKey);
    const params = {
      from: from || EMAIL_FROM(),
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };
    if (replyTo) params.reply_to = replyTo;

    const { data, error } = await resend.emails.send(params);
    if (error) throw new Error(error.message || 'Resend rejected the send.');

    if (logId) {
      try {
        await base44.entities.EmailLog.update(logId, {
          status: 'sent',
          resend_message_id: data?.id || '',
          sent_at: new Date().toISOString(),
        });
      } catch (_) { /* log update is non-critical */ }
    }
    return { ok: true, messageId: data?.id || '', logId };
  } catch (error) {
    console.error(`resend send failed [${templateKey} -> ${to}]:`, error.message);
    if (logId) {
      try {
        await base44.entities.EmailLog.update(logId, {
          status: 'failed',
          error: error.message,
          last_event_at: new Date().toISOString(),
        });
      } catch (_) { /* non-critical */ }
    }
    return { ok: false, error: error.message, logId };
  }
}

// 1. Pending Ignite OS task reminder
export async function sendTaskReminderEmail(base44, { to, firstName, tasks, phase, relatedId = '', userId = '' }) {
  return sendTransactionalEmail(base44, {
    to,
    templateKey: 'ignite_task_reminder',
    templateData: { firstName, tasks, phase },
    relatedEntity: 'ignite_os',
    relatedId,
    userId,
  });
}

// 2. Personal Checklist due-date reminder
export async function sendChecklistReminderEmail(base44, { to, firstName, taskTitle, dueDate, overdue = false, relatedId = '', userId = '' }) {
  return sendTransactionalEmail(base44, {
    to,
    templateKey: 'checklist_reminder',
    templateData: { firstName, taskTitle, dueDate, overdue },
    relatedEntity: 'checklist_task',
    relatedId,
    userId,
  });
}

// 3. Quiz completion / archetype confirmation
export async function sendQuizResultEmail(base44, { to, firstName, primaryArchetype, secondaryArchetype, relatedId = '', userId = '' }) {
  return sendTransactionalEmail(base44, {
    to,
    templateKey: 'quiz_result',
    templateData: { firstName, primaryArchetype, secondaryArchetype },
    relatedEntity: 'persona_quiz_attempt',
    relatedId,
    userId,
  });
}

// 4. Internal admin alert
export async function sendAdminNotificationEmail(base44, { heading, message, context = [], relatedEntity = '', relatedId = '' }) {
  return sendTransactionalEmail(base44, {
    to: ADMIN_INBOX(),
    templateKey: 'admin_notification',
    templateData: { heading, message, context },
    relatedEntity,
    relatedId,
  });
}

// 5. Support acknowledgment / auto-response (sends from the support inbox)
export async function sendSupportAutoReplyEmail(base44, { to, senderName, originalSubject }) {
  return sendTransactionalEmail(base44, {
    to,
    from: SUPPORT_FROM(),
    templateKey: 'support_auto_reply',
    templateData: { senderName, originalSubject },
    relatedEntity: 'inbound_email',
  });
}