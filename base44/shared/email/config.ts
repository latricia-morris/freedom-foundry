import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// Resend configuration — the single place sender identity lives.
//
// Required secret (Dashboard → Settings → Secrets):
//   RESEND_API_KEY  — your Resend API key (https://resend.com/api-keys).
//                     This app also falls back to a secret named "Resend".
//   RESEND_WEBHOOK_SECRET — the signing secret of the webhook endpoint you
//                     create in the Resend dashboard (used to verify events).
//
// Sender addresses — REPLACE the local parts below with the addresses you
// verified on your Resend domain/subdomain (https://resend.com/domains):
//   • EMAIL_FROM    — transactional app mail (reminders, quiz confirmations)
//   • SUPPORT_FROM  — the branded support inbox that receives inbound mail
//                     (route it through Resend Receiving)
// Each can also be overridden with the optional secret shown, so production
// addresses never need a code change.
// ─────────────────────────────────────────────────────────────────────────────

export function trySecret(name) {
  try {
    const value = secrets.get(name);
    return typeof value === 'string' ? value.trim() : '';
  } catch (_) {
    return '';
  }
}

// Resend API key: preferred RESEND_API_KEY, legacy fallback "Resend".
export function resendApiKey() {
  return trySecret('RESEND_API_KEY') || trySecret('Resend');
}

export function resendConfigured() {
  return resendApiKey() !== '';
}

export const EMAIL_FROM = () =>
  trySecret('RESEND_FROM_EMAIL') || 'Freedom Foundry <no-reply@thebrandrevivalist.com>';

export const SUPPORT_FROM = () =>
  trySecret('RESEND_SUPPORT_FROM_EMAIL') || 'Freedom Foundry Support <support@thebrandrevivalist.com>';

// Internal inbox for admin notifications.
export const ADMIN_INBOX = () =>
  trySecret('ADMIN_NOTIFICATION_EMAIL') || 'latricia@thebrandrevivalist.com';

export const APP_URL = 'https://brand-forge-vault.base44.app';