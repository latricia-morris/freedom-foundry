import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { trySecret } from '../../shared/email/config.ts';
import { verifyResendSignature } from '../../shared/email/signature.ts';
import { sendAdminNotificationEmail, sendSupportAutoReplyEmail } from '../../shared/email/service.ts';

// Maps Resend delivery events onto EmailLog.status values.
const STATUS_BY_EVENT = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delayed',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.failed': 'failed',
};

// Obvious automated senders we should never auto-reply to (mail loops).
const AUTOMATED_SENDER_HINTS = ['no-reply', 'noreply', 'donotreply', 'postmaster', 'mailer-daemon', 'auto-reply'];

function parseDisplayName(fromHeader) {
  const match = String(fromHeader || '').match(/^\s*"?([^"<]+?)"?\s*</);
  return match ? match[1].trim() : '';
}

export default async function(req) {
  try {
    // Signature verification is required — the endpoint is public.
    const webhookSecret = trySecret('RESEND_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return Response.json({ error: 'Webhook secret not configured — set RESEND_WEBHOOK_SECRET.' }, { status: 503 });
    }
    const rawBody = await req.text();
    const valid = await verifyResendSignature(req.headers, rawBody, webhookSecret);
    if (!valid) {
      console.error('resend-webhook: invalid signature — request rejected');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let event = {};
    try { event = JSON.parse(rawBody); } catch (_) {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    const eventType = String(event.type || '');
    const data = event.data || {};
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    // ── Delivery events → update the matching EmailLog records ──
    if (STATUS_BY_EVENT[eventType]) {
      const messageId = String(data.email_id || data.id || '');
      if (messageId) {
        const logs = await service.entities.EmailLog.filter({ resend_message_id: messageId }).catch(() => []);
        for (const log of logs || []) {
          await service.entities.EmailLog.update(log.id, {
            status: STATUS_BY_EVENT[eventType],
            last_event_at: new Date().toISOString(),
            error: eventType === 'email.bounced' || eventType === 'email.failed' ? JSON.stringify(data).slice(0, 500) : '',
          });
        }
        if ((logs || []).length && (eventType === 'email.bounced' || eventType === 'email.failed')) {
          await sendAdminNotificationEmail(service, {
            heading: `Email ${eventType === 'email.bounced' ? 'bounced' : 'failed'}`,
            message: `A transactional email could not be delivered.`,
            context: [
              { label: 'Resend message', value: messageId },
              { label: 'Subject', value: data.subject || '' },
              { label: 'Recipient', value: Array.isArray(data.to) ? data.to.join(', ') : String(data.to || '') },
            ],
          });
        }
      }
      return Response.json({ ok: true, event: eventType });
    }

    // ── Inbound email (Resend Receiving) → store + acknowledge ──
    if (eventType === 'email.received') {
      const fromAddress = String(data.from || '');
      const toAddress = String(data.to || '');
      const subject = String(data.subject || '(no subject)');
      const messageId = String(data.id || data.email_id || '');

      await service.entities.InboundEmail.create({
        from_address: fromAddress,
        to_address: toAddress,
        subject,
        message_id: messageId,
        metadata: data,
        received_at: new Date().toISOString(),
        body_text: typeof data.text === 'string' ? data.text : '',
        status: 'new',
      });

      let autoReplied = false;
      const looksAutomated = AUTOMATED_SENDER_HINTS.some((hint) => fromAddress.toLowerCase().includes(hint));
      if (fromAddress && fromAddress.includes('@') && !looksAutomated) {
        const reply = await sendSupportAutoReplyEmail(service, {
          to: fromAddress,
          senderName: parseDisplayName(fromAddress),
          originalSubject: subject,
        });
        autoReplied = reply.ok;
      }

      // Internal alert so nothing sits unseen in the inbox.
      await sendAdminNotificationEmail(service, {
        heading: 'New inbound support email',
        message: subject,
        context: [
          { label: 'From', value: fromAddress },
          { label: 'To', value: toAddress },
          { label: 'Auto-acknowledged', value: autoReplied ? 'yes' : 'no' },
        ],
      });

      return Response.json({ ok: true, stored: true, autoReplied });
    }

    return Response.json({ ok: true, ignored: eventType });
  } catch (error) {
    console.error('resend-webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}