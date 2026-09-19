# Freedom Foundry Email Layer (Resend)

Resend is the app-native email layer: transactional sends, reminders, inbound
support mail, and webhook-based delivery tracking. GoHighLevel stays
responsible for archetype-based drip campaigns and CRM nurture — the two
systems are deliberately separate.

## Files

| Path | Purpose |
|---|---|
| `base44/shared/email/config.ts` | API key resolution + sender/inbox addresses — **edit addresses here** |
| `base44/shared/email/templates.ts` | Branded HTML + plain-text templates (5 transactional templates) |
| `base44/shared/email/service.ts` | Reusable send layer: `sendTaskReminderEmail`, `sendChecklistReminderEmail`, `sendQuizResultEmail`, `sendAdminNotificationEmail`, `sendSupportAutoReplyEmail` — every send logs to `EmailLog` |
| `base44/shared/email/signature.ts` | svix HMAC-SHA256 webhook signature verification |
| `base44/functions/resend-webhook/entry.ts` | Webhook endpoint: delivery events + `email.received` inbound handling |
| `base44/functions/send-email-reminders/entry.ts` | Daily reminder sweep (supports `dry_run: true`) |
| `base44/functions/send-admin-notification/entry.ts` | Idempotent admin alerts for contact submissions, bug reports, service requests |

## Environment variables / secrets (Dashboard → Settings → Secrets)

| Secret | Purpose |
|---|---|
| `RESEND_API_KEY` | **Required.** Your Resend API key. (A secret named `Resend` also works as a fallback.) |
| `RESEND_WEBHOOK_SECRET` | **Required for webhooks.** The signing secret Resend shows when you create the webhook endpoint. Without it the webhook endpoint rejects all events (503). |
| `RESEND_FROM_EMAIL` | Optional. Overrides the transactional sender, e.g. `Freedom Foundry <no-reply@yourdomain.com>` |
| `RESEND_SUPPORT_FROM_EMAIL` | Optional. Overrides the branded support sender used for auto-replies. |
| `ADMIN_NOTIFICATION_EMAIL` | Optional. Overrides the internal admin alert inbox. |

## Sender & inbox addresses

Set once in `config.ts` (or via the optional secrets above):

- **Transaction sender**: `Freedom Foundry <no-reply@thebrandrevivalist.com>` —
  must be on your **verified Resend domain**.
- **Support inbox**: `Freedom Foundry Support <support@thebrandrevivalist.com>` —
  the address users email; route it through Resend Receiving to this app.
- **Admin alert inbox**: `latricia@thebrandrevivalist.com`.

## One-time Resend dashboard setup

1. Verify your domain at https://resend.com/domains (transactional mail must
   come from it).
2. Webhooks → https://resend.com/webhooks → create endpoint:
   `https://brand-forge-vault.base44.app/functions/resend-webhook`
   and subscribe to: `email.sent`, `email.delivered`, `email.delivery_delayed`,
   `email.bounced`, `email.complained`, `email.opened`, `email.clicked`,
   `email.received`. Copy the **Signing Secret** into app secrets as
   `RESEND_WEBHOOK_SECRET`.
3. Receiving → route your support address to the same webhook so
   `email.received` events flow in (sender, recipient, subject, metadata and
   timestamp are stored in `InboundEmail`; the full body arrives when Resend
   includes it, otherwise fetch it from the Receiving API).

## Data models

- `EmailLog` — every send: recipient, subject, template, status, Resend message
  id, timestamps, error text. Admin-only access; webhook events update status.
- `InboundEmail` — every inbound message: sender, recipient, subject,
  metadata, received timestamp, body text when present, auto-reply flag.
  Admin-only access.

## Triggers

- **Daily Brand Reminders workflow** (8:00 AM ET, daily) → `send-email-reminders`:
  pending Ignite OS action items + checklist tasks due within 3 days or
  overdue. Idempotent per user/record per day.
- **Contact Submission / Bug Report / Service Request Admin Alert workflows**
  (entity-create triggers) → `send-admin-notification` → Resend admin alert.
  Drafts saved for later do not alert.
- **Quiz completion** → immediate Resend confirmation from the `persona-quiz`
  function (member and anonymous paths). The GHL archetype drip push is a
  separate CRM-side concern — wire it in `persona-quiz/entry.ts` right after
  the Resend send when GHL credentials are available.

## Testing

- `send-email-reminders` accepts `{ "dry_run": true }` to preview who would be
  emailed without sending anything.
- Failures log to the function logs and are recorded on `EmailLog` (`status:
  failed`, with the error text).