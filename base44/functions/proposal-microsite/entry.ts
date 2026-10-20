import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import Stripe from "npm:stripe@17.0.0";
import { secrets } from "base44:runtime";
import { applySelections } from "../../shared/agency/core.ts";
import { createDepositCheckout } from "../../shared/proposal/payments.ts";
import {
  AGENCY,
  CONSENTS,
  CONSENTS_VERSION,
  OFFLINE_INSTRUCTIONS,
  OFFLINE_REMINDER,
} from "../../shared/proposal/content.ts";
import { writeAudit } from "../../shared/agency/core.ts";
import { proposalGate } from "../../shared/proposal/access.ts";
import { isStudio, publicStudio } from "../../shared/proposal/studioDocument.ts";
import { studioQuote } from "../../shared/proposal/studioPricing.ts";

const FALLBACK_ORIGIN = "https://brand-forge-vault.base44.app";

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isExpired(doc) {
  if (!doc.expiry_date) return false;
  // Expiry cutoff is the end of the stated day, America/New_York (UTC-4/-5).
  const cutoff = new Date(`${doc.expiry_date}T23:59:59-04:00`).getTime();
  return !isNaN(cutoff) && Date.now() > cutoff;
}

function publicPayload(doc, client) {
  if (isStudio(doc)) {
    const frozen = doc.parsed_payload_cache?.issued_snapshot || {};
    return { ...publicStudio({ ...doc, ...frozen, signing: doc.signing, status: doc.status, content_digest: doc.content_digest }), consents: CONSENTS, consents_version: CONSENTS_VERSION, agency: AGENCY, payment_preference: doc.payment_preference || 'online', offline_available: Boolean(OFFLINE_INSTRUCTIONS), offline_instructions: OFFLINE_INSTRUCTIONS, offline_reminder: OFFLINE_REMINDER };
  }
  const isIndividual = doc.recipient?.is_individual === true;
  return {
    id: doc.id,
    title: doc.title,
    status: doc.status,
    version: doc.version,
    issue_date: doc.issue_date,
    expiry_date: doc.expiry_date,
    currency: doc.currency || "USD",
    content: doc.content || {},
    investment: {
      mode: doc.investment?.mode || "fixed",
      items: (doc.investment?.items || []).map((i) => ({
        id: i.id || i.label,
        label: i.label,
        kind: i.kind || "required",
        tier_group: i.tier_group || "",
        quantity_default: i.quantity_default ?? 1,
        quantity_min: i.quantity_min ?? 0,
        quantity_max: i.quantity_max ?? null,
        unit_price_cents: i.unit_price_cents || 0,
        unit: i.unit || "",
        description: i.description || "",
      })),
      credits: doc.investment?.credits || [],
      schedule: doc.investment?.schedule || [],
      monthly: doc.investment?.monthly || null,
      future_work: doc.investment?.future_work || [],
    },
    timeline: doc.timeline || {},
    agreement_sections: doc.agreement_sections || [],
    agreement_version: doc.agreement_version,
    sections_visible: doc.sections_visible || {},
    content_digest: doc.content_digest || "",
    signing: doc.signing || {},
    consents: CONSENTS,
    consents_version: CONSENTS_VERSION,
    payment_preference: doc.payment_preference || "online",
    offline_available: Boolean(OFFLINE_INSTRUCTIONS),
    offline_reminder: OFFLINE_REMINDER,
    offline_instructions: OFFLINE_INSTRUCTIONS,
    recipient: {
      full_name: doc.recipient?.full_name || "",
      greeting_name: doc.recipient?.greeting_name || "",
      email: doc.recipient?.notice_email || "",
      title: doc.recipient?.title || "",
      company_name: isIndividual ? "" : doc.recipient?.company_name || "",
      contracting_party_name: doc.recipient?.contracting_party_name || "",
      is_individual: isIndividual,
      phone: doc.recipient?.phone || "",
      designated_signers: doc.recipient?.designated_signers || [],
    },
    agency: {
      legal_entity: AGENCY.legal_entity,
      presentation_brand: AGENCY.presentation_brand,
      representative: AGENCY.representative,
      signature_title: AGENCY.signature_title,
      notice_email: AGENCY.notice_email,
      website: AGENCY.website,
    },
    client_label: client?.company_name || "",
  };
}

async function findDoc(svc, token) {
  if (!token) return null;
  const rows = await svc.entities.ProposalDoc.filter({ share_token: token }, "-created_date", 5);
  return rows && rows.length ? rows[0] : null;
}

// A share token alone never grants access: admins may always preview, and
// otherwise the signed-in email must be the proposal's notice email or on the
// client record.
async function gateAccess(base44, svc, doc) {
  const client = doc.agency_client_id
    ? await svc.entities.AgencyClient.get(doc.agency_client_id).catch(() => null)
    : null;
  return proposalGate(base44, [
    doc.recipient?.notice_email,
    doc.recipient?.email,
    client?.primary_contact_email,
    ...(client?.portal_member_emails || []),
  ]);
}

async function ensureInstallments(svc, doc, lines, totalCents, schedule) {
  let installments = await svc.entities.PaymentInstallment.filter({ proposal_id: doc.id }, "sort_order", 20);
  if (installments && installments.length) return installments;
  const drafts = [];
  let allocated = 0;
  schedule.forEach((entry, i) => {
    const amount = entry.amount_cents != null ? Math.round(entry.amount_cents) : Math.round((totalCents * (entry.percent || 0)) / 100);
    if (amount <= 0) return;
    allocated += amount;
    drafts.push({
      proposal_id: doc.id,
      client_id: doc.agency_client_id,
      installment_type: i === 0 ? "deposit" : "final",
      description: entry.due_event || entry.label || (i === 0 ? "Due upon acceptance" : "Balance"),
      amount_cents: amount,
      status: "pending",
      verification_status: "unverified",
      sort_order: i,
    });
  });
  const remainder = totalCents - allocated;
  if (remainder > 0) {
    drafts.push({
      proposal_id: doc.id,
      client_id: doc.agency_client_id,
      installment_type: "final",
      description: "Remaining balance",
      amount_cents: remainder,
      status: "pending",
      verification_status: "unverified",
      sort_order: drafts.length,
    });
  }
  installments = await svc.entities.PaymentInstallment.bulkCreate(drafts);
  return installments;
}

async function createCheckout(req, doc, installment, amountCents) {
  const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
  return createDepositCheckout(req, stripe, {
    fallbackOrigin: FALLBACK_ORIGIN,
    amountCents,
    productName: `Proposal deposit — ${doc.title}`,
    proposalId: doc.id,
    metadata: {
      payment_type: "proposal_deposit",
      base44_proposal_id: doc.id,
      base44_installment_id: installment.id,
      base44_doc_token: doc.share_token,
    },
    successPath: `/proposal/${doc.share_token}?payment=success`,
    cancelPath: `/proposal/${doc.share_token}?payment=cancelled`,
  });
}

async function notifyAdmin(svc, doc, subject, message) {
  try {
    const admins = await svc.entities.User.filter({ role: "admin" }, "created_date", 5);
    const email = (admins || []).find((u) => u.email)?.email;
    if (email) {
      await svc.integrations.Core.SendEmail({ to: email, subject, body: message });
    }
  } catch (e) {
    console.error("admin notify failed", e.message);
  }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'quote-studio') {
      const doc = await findDoc(svc, body.token);
      if (!doc) return Response.json({ error: 'not_found' }, { status: 404 });
      const gate = await gateAccess(base44, svc, doc);
      if (gate.error) return Response.json({ error: gate.error }, { status: gate.status });
      return Response.json({ quote: studioQuote(doc.parsed_payload_cache?.issued_snapshot?.investment || doc.investment, body.selections || {}) });
    }
    if (action === "view") {
      const doc = await findDoc(svc, body.token);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      const gate = await gateAccess(base44, svc, doc);
      if (gate.error) return Response.json({ error: gate.error }, { status: gate.status });
      const tokenEntry = (doc.tokens || []).find((t) => t.token === body.token);
      if (doc.status === "superseded" || (tokenEntry && tokenEntry.active === false)) {
        const activeTok = (doc.tokens || []).find((t) => t.active);
        return Response.json({ error: "superseded", active_token: activeTok?.token || "" });
      }
      const client = await svc.entities.AgencyClient.get(doc.agency_client_id).catch(() => null);
      if (doc.status === "published") {
        await svc.entities.ProposalDoc.update(doc.id, { status: "viewed", viewed_at: new Date().toISOString() });
        doc.status = "viewed";
      }
      if (isExpired(doc) && ["viewed", "published", "changes_requested"].includes(doc.status)) {
        await svc.entities.ProposalDoc.update(doc.id, { status: "expired" });
        doc.status = "expired";
      }
      const installments = await svc.entities.PaymentInstallment.filter({ proposal_id: doc.id }, "sort_order", 20);
      return Response.json({
        proposal: publicPayload(doc, client),
        installments: (installments || []).map((i) => ({
          id: i.id,
          installment_type: i.installment_type,
          description: i.description,
          amount_cents: i.amount_cents,
          status: i.status,
        })),
      });
    }

    if (action === "sign") {
      const stored = await findDoc(svc, body.token);
      const doc = stored ? { ...stored, ...(stored.parsed_payload_cache?.issued_snapshot || {}), signing: stored.signing, status: stored.status, content_digest: stored.content_digest } : null;
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      const gate = await gateAccess(base44, svc, doc);
      if (gate.error) return Response.json({ error: gate.error }, { status: gate.status });
      const tokenEntry = (doc.tokens || []).find((t) => t.token === body.token);
      if (!tokenEntry || tokenEntry.active === false) return Response.json({ error: "superseded" }, { status: 409 });
      if (["signed_awaiting_payment", "awaiting_offline_deposit", "deposit_paid", "paid_in_full"].includes(doc.status)) {
        return Response.json({ error: "already_accepted" }, { status: 400 });
      }
      if (isExpired(doc)) {
        await svc.entities.ProposalDoc.update(doc.id, { status: "expired" });
        return Response.json({ error: "expired" }, { status: 400 });
      }
      if (!["published", "viewed", "changes_requested"].includes(doc.status)) {
        return Response.json({ error: "not_available" }, { status: 400 });
      }

      const signer = {
        name: String(body.signer_name || "").trim(),
        email: String(body.signer_email || "").trim(),
        title: String(body.signer_title || "").trim(),
        company: String(body.signer_company || "").trim(),
      };
      if (signer.name.length < 2) return Response.json({ error: "signature_required" }, { status: 400 });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signer.email)) return Response.json({ error: "signer_email_required" }, { status: 400 });
      if (isStudio(doc) && !(doc.recipient.designated_signers || [doc.recipient.notice_email]).map(e => String(e).toLowerCase()).includes(signer.email.toLowerCase())) return Response.json({ error: 'Use the designated signing email.' }, { status: 403 });
      if (body.consents?.proposal !== true || body.consents?.electronic !== true) {
        return Response.json({ error: "agreement_required" }, { status: 400 });
      }
      const isIndividual = doc.recipient?.is_individual === true;
      if (!isIndividual && body.consents?.authority !== true) {
        return Response.json({ error: "authority_required" }, { status: 400 });
      }

      // Server-side pricing from stored line items. Client-sent amounts are never trusted.
      const items = (doc.investment?.items || []).map((i) => ({
        id: i.id || i.label,
        title: i.label,
        item_type: i.kind || "required",
        tier_group: i.tier_group || "",
        default_quantity: i.quantity_default ?? 1,
        quantity_min: i.quantity_min ?? 0,
        quantity_max: i.quantity_max ?? null,
        unit_price_cents: i.unit_price_cents || 0,
        display_order: i.display_order || 0,
      }));
      const studioPrice = isStudio(doc) ? studioQuote(doc.investment, body.selections || {}) : null;
      const { lines, totalCents, errors } = studioPrice || applySelections(items, body.selections || {});
      if (errors.length) return Response.json({ error: "validation", errors }, { status: 400 });
      if (totalCents <= 0) return Response.json({ error: "validation", errors: ["Total must be greater than zero."] }, { status: 400 });

      const schedule = studioPrice ? studioPrice.obligations : doc.investment?.schedule || [];
      const depositPct = schedule[0]?.percent ?? 50;
      const depositCents = studioPrice ? studioPrice.depositCents : Math.round((totalCents * depositPct) / 100);
      if (isStudio(doc) && body.approved_digest !== doc.content_digest) return Response.json({ error: 'The issued version changed. Reload before signing.' }, { status: 409 });

      // Freeze the exact accepted version
      const nowISO = new Date().toISOString();
      const frozen = {
        content: doc.content,
        timeline: doc.timeline,
        agreement_sections: doc.agreement_sections,
        agreement_version: doc.agreement_version,
        investment_lines: lines,
        total_cents: totalCents,
        schedule,
        deposit_cents: depositCents,
        recipient: doc.recipient,
        title: doc.title,
        version: doc.version,
        consents: { proposal: CONSENTS.proposal, electronic: CONSENTS.electronic, authority: isIndividual ? "" : CONSENTS.authority.replace("{contracting_party}", doc.recipient?.contracting_party_name || "") },
        consents_version: CONSENTS_VERSION,
      };
      const digest = await sha256(JSON.stringify(frozen));
      const signatureData = body.signature_kind === "draw" && typeof body.signature_data === "string" && body.signature_data.startsWith("data:image/png;base64,") && body.signature_data.length < 200000
        ? body.signature_data
        : "";

      await svc.entities.ProposalDoc.update(doc.id, {
        status: "signed_awaiting_payment",
        signing: {
          status: "signed",
          signer_name: signer.name,
          signer_email: signer.email,
          signer_title: signer.title,
          signer_company: signer.company,
          signature_kind: body.signature_kind === "draw" ? "draw" : "type",
          signature_data: signatureData,
          signed_at_utc: nowISO,
          consents: frozen.consents,
          consents_version: CONSENTS_VERSION,
          content_digest: digest,
          lines,
          total_cents: totalCents,
          deposit_cents: depositCents,
          selections: body.selections || {},
          snapshot: isStudio(doc) ? { ...publicPayload(doc, null), accepted_lines: lines, total_cents: totalCents, deposit_cents: depositCents, accepted_selections: body.selections || {}, approved_version_digest: doc.content_digest } : undefined,
          proposal_version: doc.version,
          approved_version_digest: doc.content_digest,
          ip_note: "Server timestamp recorded; identity evidenced by verified email challenge when required.",
        },
        content_digest: digest,
        signed_at: nowISO,
        accepted_scope_snapshot: frozen,
        project_activation_status: "awaiting_deposit",
      });
      await writeAudit(svc, {
        entity_type: "ProposalDoc",
        entity_id: doc.id,
        action: "proposal_signed",
        source: "client_accept",
        after_value: { version: doc.version, total_cents: totalCents, deposit_cents: depositCents, digest },
      });

      const installments = await ensureInstallments(svc, doc, lines, totalCents, schedule);
      const deposit = (installments || []).find((i) => i.installment_type === "deposit");
      if (!deposit) return Response.json({ error: "installment_error" }, { status: 500 });

      await notifyAdmin(svc, doc, `Proposal signed — ${doc.title}`, `${signer.name} accepted ${doc.title} (version ${doc.version}). Deposit due: $${(depositCents / 100).toFixed(2)}.`);

      // Signed email to the client
      const origin = req.headers.get("origin") || FALLBACK_ORIGIN;
      await svc.integrations.Core.SendEmail({
        to: doc.recipient?.notice_email || signer.email,
        template_name: "ProposalSigned",
        variables: {
          first_name: doc.recipient?.greeting_name || signer.name.split(" ")[0] || "there",
          proposal_url: `${origin}/proposal/${doc.share_token}`,
        },
      }).catch((e) => console.error("signed email failed", e.message));

      if (body.payment_preference === "offline" && OFFLINE_INSTRUCTIONS) {
        await svc.entities.ProposalDoc.update(doc.id, {
          status: "awaiting_offline_deposit",
          payment_preference: "offline",
        });
        await notifyAdmin(svc, doc, `Offline payment preference — ${doc.title}`, `${signer.name} chose check or cash for ${doc.title}. Deposit remains outstanding until receipt is confirmed.`);
        return Response.json({ accepted: true, offline: true, deposit_cents: depositCents, total_cents: totalCents });
      }

      const { url, session_id } = await createCheckout(req, doc, deposit, depositCents);
      await svc.entities.PaymentInstallment.update(deposit.id, {
        stripe_checkout_session_id: session_id,
        payment_link_url: url,
        status: "checkout_opened",
      });
      return Response.json({ accepted: true, checkout_url: url, deposit_cents: depositCents, total_cents: totalCents });
    }

    if (action === "checkout") {
      const doc = await findDoc(svc, body.token);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      const gate = await gateAccess(base44, svc, doc);
      if (gate.error) return Response.json({ error: gate.error }, { status: gate.status });
      const installments = await svc.entities.PaymentInstallment.filter({ proposal_id: doc.id }, "sort_order", 20);
      const deposit = (installments || []).find((i) => i.installment_type === "deposit");
      if (!deposit) return Response.json({ error: "not_available" }, { status: 400 });
      if (deposit.status === "paid") return Response.json({ paid: true });
      const { url, session_id } = await createCheckout(req, doc, deposit, deposit.amount_cents);
      await svc.entities.PaymentInstallment.update(deposit.id, {
        stripe_checkout_session_id: session_id,
        payment_link_url: url,
        status: "checkout_opened",
      });
      return Response.json({ checkout_url: url });
    }

    if (action === "status") {
      const doc = await findDoc(svc, body.token);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      const gate = await gateAccess(base44, svc, doc);
      if (gate.error) return Response.json({ error: gate.error }, { status: gate.status });
      return Response.json({ status: doc.status, project_activation_status: doc.project_activation_status || "" });
    }

    if (action === "offline") {
      const doc = await findDoc(svc, body.token);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      const gate = await gateAccess(base44, svc, doc);
      if (gate.error) return Response.json({ error: gate.error }, { status: gate.status });
      if (!OFFLINE_INSTRUCTIONS) return Response.json({ error: "not_configured" }, { status: 400 });
      if (!["signed_awaiting_payment", "awaiting_offline_deposit"].includes(doc.status)) {
        return Response.json({ error: "not_available" }, { status: 400 });
      }
      await svc.entities.ProposalDoc.update(doc.id, {
        status: "awaiting_offline_deposit",
        payment_preference: "offline",
      });
      await notifyAdmin(svc, doc, `Offline payment preference — ${doc.title}`, `${doc.signing?.signer_name || "The client"} chose check or cash for ${doc.title}. Deposit remains outstanding until receipt is confirmed.`);
      return Response.json({ ok: true });
    }

    if (action === "request-change") {
      const doc = await findDoc(svc, body.token);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      const gate = await gateAccess(base44, svc, doc);
      if (gate.error) return Response.json({ error: gate.error }, { status: gate.status });
      const message = String(body.message || "").trim().slice(0, 4000);
      if (message.length < 5) return Response.json({ error: "message_required" }, { status: 400 });
      const entry = {
        message,
        from: String(body.from_name || "Client"),
        requested_at: new Date().toISOString(),
        status: "open",
      };
      await svc.entities.ProposalDoc.update(doc.id, {
        change_requests: [...(doc.change_requests || []), entry],
        status: ["published", "viewed"].includes(doc.status) ? "changes_requested" : doc.status,
      });
      await writeAudit(svc, {
        entity_type: "ProposalDoc",
        entity_id: doc.id,
        action: "change_requested",
        source: "client_request",
        after_value: { message: message.slice(0, 200) },
      });
      await notifyAdmin(svc, doc, `Change request — ${doc.title}`, `${entry.from}: ${message}`);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    console.error("proposal-microsite error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}