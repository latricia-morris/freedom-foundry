import { APP_URL } from './config.ts';

// Branded transactional email templates for Freedom Foundry by The Brand Revivalist®.
// Each template provides a mobile-friendly HTML version plus a plain-text
// fallback. These are transactional messages only — archetype nurture drips and
// marketing campaigns live in GoHighLevel.

const INK = '#14110f';
const PANEL = '#fafbfc';
const EMBER = '#9f1f28';
const MUTED = '#5c5648';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escape and preserve line breaks for multi-line bodies.
function bodyHtml(text) {
  return escapeHtml(text).split('\n').join('<br>');
}

function baseHtml({ heading, preGreeting, bodyHtml: content, ctaLabel, ctaUrl, footerNote }) {
  const cta = ctaUrl && ctaLabel
    ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 6px;">
      <tr><td>
        <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background-color:${EMBER};color:#ffffff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:13px 28px;border-radius:2px;">${escapeHtml(ctaLabel)}</a>
      </td></tr>
    </table>`
    : '';
  const greeting = preGreeting
    ? `<p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:${MUTED};line-height:1.65;margin:0 0 16px;">${escapeHtml(preGreeting)},</p>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eceae4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eceae4;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background-color:${PANEL};border:1px solid #ddd6c8;">
  <tr><td style="background-color:${INK};padding:28px 32px;">
    <div style="font-family:Georgia,serif;font-size:20px;letter-spacing:5px;color:#f0d9b5;">FREEDOM FOUNDRY</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#8a8378;margin-top:6px;">BY THE BRAND REVIVALIST&reg;</div>
  </td></tr>
  <tr><td style="padding:32px;">
    ${greeting}
    <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;color:${INK};margin:0 0 12px;line-height:1.3;">${escapeHtml(heading)}</h1>
    ${content}
    ${cta}
  </td></tr>
  <tr><td style="padding:18px 32px 26px;border-top:1px solid #e6e0d2;">
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:${MUTED};line-height:1.6;">
      ${footerNote ? `${escapeHtml(footerNote)}<br>` : ''}
      This is a transactional message from Freedom Foundry by The Brand Revivalist&reg;.<br>
      Brand nurture and campaign emails arrive separately.
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function para(text) {
  return `<p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:${MUTED};line-height:1.65;margin:0 0 14px;">${bodyHtml(text)}</p>`;
}

function contextTable(rows) {
  const items = (rows || [])
    .filter((row) => row && row.label)
    .map((row) => `
      <tr>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8a8378;padding:8px 12px 8px 0;vertical-align:top;white-space:nowrap;">${escapeHtml(row.label)}</td>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${INK};padding:8px 0;vertical-align:top;line-height:1.55;">${bodyHtml(row.value || '')}</td>
      </tr>`)
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:10px 0 16px;border-top:1px solid #e6e0d2;">${items}</table>`;
}

const TEMPLATES = {
  // 1. Pending Ignite OS task reminder
  ignite_task_reminder: (data = {}) => {
    const tasks = (data.tasks || []).slice(0, 8);
    const listHtml = `<ul style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:${INK};line-height:1.65;margin:0 0 14px;padding-left:20px;">${tasks
      .map((task) => `<li style="margin-bottom:6px;">${escapeHtml(task)}</li>`)
      .join('')}</ul>`;
    const remaining = (data.tasks || []).length - tasks.length;
    return {
      subject: 'Your Ignite OS action items are waiting',
      html: baseHtml({
        heading: 'Ignite OS momentum check',
        preGreeting: `Hi ${data.firstName || 'there'}`,
        bodyHtml:
          para(
            `You have ${tasks.length} pending action item${tasks.length === 1 ? '' : 's'} in Ignite OS` +
            (data.phase ? ` for ${data.phase}` : '') +
            '.'
          ) + listHtml +
          (remaining > 0 ? para(`…plus ${remaining} more in the portal.`) : '') +
          para('A few minutes today keeps the activation moving. Open Ignite OS to check items off as you go.'),
        ctaLabel: 'Open Ignite OS',
        ctaUrl: `${APP_URL}/brand-portal/ignite`,
      }),
      text: [
        `Hi ${data.firstName || 'there'},`,
        '',
        `You have ${(data.tasks || []).length} pending action item(s) in Ignite OS${data.phase ? ` for ${data.phase}` : ''}:`,
        ...(data.tasks || []).map((task) => `- ${task}`),
        '',
        'Open your Ignite OS board: ' + `${APP_URL}/brand-portal/ignite`,
        '',
        '— Freedom Foundry by The Brand Revivalist(R)',
      ].join('\n'),
    };
  },

  // 2. Personal Checklist due-date reminder
  checklist_reminder: (data = {}) => {
    const dueLabel = data.overdue
      ? `was due ${data.dueDate} and is still open`
      : `is due ${data.dueDate}`;
    return {
      subject: `${data.overdue ? 'Overdue checklist task' : 'Checklist reminder'}: ${data.taskTitle || 'your brand checklist'}`,
      html: baseHtml({
        heading: data.overdue ? 'A checklist task needs you' : 'A checklist task is coming due',
        preGreeting: `Hi ${data.firstName || 'there'}`,
        bodyHtml:
          para(`"${data.taskTitle || 'Your checklist task'}" ${dueLabel}.`) +
          para('Keep the streak alive — open your Brand Checklist and move it across the line.'),
        ctaLabel: 'Open Brand Checklist',
        ctaUrl: `${APP_URL}/brand-portal/checklist`,
      }),
      text: [
        `Hi ${data.firstName || 'there'},`,
        '',
        `"${data.taskTitle || 'Your checklist task'}" ${dueLabel}.`,
        '',
        'Open your Brand Checklist: ' + `${APP_URL}/brand-portal/checklist`,
        '',
        '— Freedom Foundry by The Brand Revivalist(R)',
      ].join('\n'),
    };
  },

  // 3. Quiz completion / archetype result confirmation
  quiz_result: (data = {}) => ({
    subject: 'Your Brand Persona result is in',
    html: baseHtml({
      heading: `${data.firstName || 'Friend'}, meet your brand archetype`,
      bodyHtml:
        para('Your Brand Persona Discovery results are locked in.') +
        contextTable([
          { label: 'Primary', value: `${data.primaryArchetype || '—'} archetype` },
          { label: 'Secondary', value: `${data.secondaryArchetype || '—'} archetype` },
        ]) +
        para('Your full archetype report and what it means for your positioning are waiting in the portal — and deeper, personalized insight will follow by email.'),
      ctaLabel: 'View my result',
      ctaUrl: `${APP_URL}/brand-persona-quiz/results`,
      footerNote: 'You are receiving this because you completed the Brand Persona Discovery quiz.',
    }),
    text: [
      `Hi ${data.firstName || 'there'},`,
      '',
      'Your Brand Persona Discovery results are in.',
      `Primary archetype: ${data.primaryArchetype || '—'}`,
      `Secondary archetype: ${data.secondaryArchetype || '—'}`,
      '',
      'View your result: ' + `${APP_URL}/brand-persona-quiz/results`,
      '',
      '— Freedom Foundry by The Brand Revivalist(R)',
    ].join('\n'),
  }),

  // 4. General admin notification
  admin_notification: (data = {}) => ({
    subject: `[Freedom Foundry] ${data.heading || 'Notification'}`,
    html: baseHtml({
      heading: data.heading || 'Portal notification',
      bodyHtml:
        para(data.message || '') +
        contextTable(data.context || []),
      footerNote: 'Automated internal alert from the Freedom Foundry email layer.',
    }),
    text: [
      data.heading || 'Portal notification',
      '',
      data.message || '',
      ...(data.context || []).map((row) => `${row.label}: ${row.value || ''}`),
      '',
      '— Freedom Foundry email layer',
    ].join('\n'),
  }),

  // 5. Support acknowledgment / auto-response
  support_auto_reply: (data = {}) => ({
    subject: 'We received your message',
    html: baseHtml({
      heading: 'Your message is in the queue',
      preGreeting: `Hi ${data.senderName || 'there'}`,
      bodyHtml:
        para(`Thanks for writing to Freedom Foundry Support — we received your message${data.originalSubject ? ` "${data.originalSubject}"` : ''}.`) +
        para('A member of the team personally reviews every message. You can expect a thoughtful reply within 1–2 business days (Monday through Friday, 9am–5pm ET).'),
      ctaLabel: 'Visit Freedom Foundry',
      ctaUrl: `${APP_URL}/contact`,
      footerNote: 'This is an automatic acknowledgment — no reply is needed.',
    }),
    text: [
      `Hi ${data.senderName || 'there'},`,
      '',
      `Thanks for writing to Freedom Foundry Support — we received your message${data.originalSubject ? ` "${data.originalSubject}"` : ''}.`,
      'A member of the team personally reviews every message; expect a reply within 1-2 business days (Mon-Fri, 9am-5pm ET).',
      '',
      `${APP_URL}/contact`,
      '',
      '— Freedom Foundry by The Brand Revivalist(R)',
    ].join('\n'),
  }),
};

// Render a template by key. Returns { subject, html, text } or null.
export function renderTemplate(templateKey, data = {}) {
  const template = TEMPLATES[templateKey];
  if (!template) return null;
  return template(data);
}