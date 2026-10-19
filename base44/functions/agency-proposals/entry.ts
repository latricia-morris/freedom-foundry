import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@17.0.0";
import {
  applySelections,
  depositCentsFor,
  buildInstallmentDrafts,
  handleDepositPaid,
  writeAudit,
} from "../../shared/agency/core.ts";
import { createDepositCheckout } from "../../shared/proposal/payments.ts";
import { proposalGate } from "../../shared/proposal/access.ts";

const FALLBACK_ORIGIN = "https://brand-forge-vault.base44.app";

function publicProposal(proposal, client) {
  return {
    id: proposal.id,
    title: proposal.title,
    status: proposal.status,
    expiration_date: proposal.expiration_date || null,
    agreement_text: proposal.agreement_text || "",
    deposit_rule_type: proposal.deposit_rule_type,
    deposit_rule_value: proposal.deposit_rule_value,
    accepted_contract_total_cents: proposal.accepted_contract_total_cents ?? null,
    signed_by_name: proposal.signed_by_name || "",
    deposit_cents: proposal.accepted_scope_snapshot?.deposit_cents ?? null,
    milestone_rules: proposal.accepted_scope_snapshot?.milestone_rules || [],
    client: {
      company_name: client?.company_name || "",
      primary_contact_name: client?.primary_contact_name || "",
    },
  };
}

function publicItem(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    item_type: item.item_type,
    tier_group: item.tier_group || "",
    default_quantity: item.default_quantity ?? 1,
    quantity_min: item.quantity_min ?? 1,
    quantity_max: item.quantity_max ?? null,
    quantity_label: item.quantity_label || "",
    pricing_visible: item.pricing_visible !== false,
    unit_price_cents: item.pricing_visible !== false ? Math.max(0, item.unit_price_cents || 0) : null,
    display_order: item.display_order || 0,
  };
}

function isExpired(proposal) {
  if (!proposal.expiration_date) return false;
  const exp = new Date(proposal.expiration_date);
  return !isNaN(exp.getTime()) && exp.getTime() < Date.now();
}

async function findProposal(svc, token) {
  if (!token) return null;
  const rows = await svc.entities.Proposal.filter({ share_token: token }, "-created_date", 5);
  return rows && rows.length ? rows[0] : null;
}

// Resolve a token to its proposal + client, then enforce account access.
// Anonymous requesters are sent to sign in; a signed-in email that is not on
// the client record is rejected. Admins may always preview.
async function gateFor(base44, svc, token) {
  const proposal = await findProposal(svc, token);
  if (!proposal) return { error: "not_found", status: 404 };
  const client = await svc.entities.AgencyClient.get(proposal.client_id).catch(() => null);
  const gate = await proposalGate(base44, [
    client?.primary_contact_email,
    ...(client?.portal_member_emails || []),
  ]);
  if (gate.error) return gate;
  return { proposal, client, user: gate.user };
}

async function createCheckout(svc, req, proposal, installment, depositAmtCents) {
  const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
  return createDepositCheckout(req, stripe, {
    fallbackOrigin: FALLBACK_ORIGIN,
    amountCents: depositAmtCents,
    productName: `Project deposit — ${proposal.title}`,
    proposalId: proposal.id,
    metadata: {
      base44_proposal_id: proposal.id,
      base44_installment_id: installment.id,
      payment_type: "deposit",
      accepted_contract_total_cents: String(proposal.accepted_contract_total_cents || 0),
      deposit_amount_cents: String(depositAmtCents),
    },
    successPath: `/p/${proposal.share_token}?payment=success`,
    cancelPath: `/p/${proposal.share_token}?payment=cancelled`,
  });
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const svc = base44.asServiceRole;

    // Client: opens their proposal link (account required)
    if (action === "view") {
      const g = await gateFor(base44, svc, body.token);
      if (g.error) return Response.json({ error: g.error }, { status: g.status });
      const proposal = g.proposal;
      if (proposal.status === "sent") {
        await svc.entities.Proposal.update(proposal.id, {
          status: "viewed",
          viewed_at: new Date().toISOString(),
        });
        proposal.status = "viewed";
        await writeAudit(svc, {
          entity_type: "Proposal",
          entity_id: proposal.id,
          action: "proposal_viewed",
          source: "api",
        });
      }
      const items = await svc.entities.ProposalLineItem.filter(
        { proposal_id: proposal.id },
        "display_order",
        200
      );
      return Response.json({ proposal: publicProposal(proposal, g.client), items: items.map(publicItem) });
    }

    // Client signs + pays deposit. Totals are computed server-side
    // from stored line items — client-sent amounts are never trusted.
    if (action === "accept") {
      const g = await gateFor(base44, svc, body.token);
      if (g.error) return Response.json({ error: g.error }, { status: g.status });
      const proposal = g.proposal;
      if (proposal.status === "deposit_paid") {
        return Response.json({ error: "already_paid" }, { status: 400 });
      }
      if (["accepted_awaiting_deposit", "deposit_checkout_opened"].includes(proposal.status)) {
        const installments = await svc.entities.PaymentInstallment.filter(
          { proposal_id: proposal.id },
          "sort_order",
          20
        );
        const deposit = (installments || []).find((i) => i.installment_type === "deposit");
        if (deposit && deposit.status !== "paid") {
          const { url, session_id } = await createCheckout(svc, req, proposal, deposit, deposit.amount_cents);
          await svc.entities.PaymentInstallment.update(deposit.id, {
            stripe_checkout_session_id: session_id,
            payment_link_url: url,
            status: "checkout_opened",
          });
          await svc.entities.Proposal.update(proposal.id, { status: "deposit_checkout_opened" });
          return Response.json({ already_accepted: true, checkout_url: url });
        }
        return Response.json({ error: "already_accepted" }, { status: 400 });
      }
      if (isExpired(proposal)) {
        await svc.entities.Proposal.update(proposal.id, { status: "expired" });
        return Response.json({ error: "expired" }, { status: 400 });
      }
      if (!["sent", "viewed", "selections_in_progress"].includes(proposal.status)) {
        return Response.json({ error: "not_available" }, { status: 400 });
      }
      if (!body.signature_name || String(body.signature_name).trim().length < 2) {
        return Response.json({ error: "signature_required" }, { status: 400 });
      }
      if (body.agree !== true) {
        return Response.json({ error: "agreement_required" }, { status: 400 });
      }

      const items = await svc.entities.ProposalLineItem.filter(
        { proposal_id: proposal.id },
        "display_order",
        200
      );
      const { lines, totalCents, errors } = applySelections(items, body.selections || {});
      if (errors.length) return Response.json({ error: "validation", errors }, { status: 400 });

      const depositAmt = depositCentsFor(totalCents, proposal.deposit_rule_type, proposal.deposit_rule_value);
      const snapshot = {
        lines,
        total_cents: totalCents,
        deposit_cents: depositAmt,
        deposit_rule_type: proposal.deposit_rule_type,
        deposit_rule_value: proposal.deposit_rule_value,
        milestone_rules: proposal.milestone_rules || [],
        agreement_version: proposal.version || 1,
        accepted_at: new Date().toISOString(),
        signed_by: String(body.signature_name).trim(),
      };

      await svc.entities.Proposal.update(proposal.id, {
        status: "accepted_awaiting_deposit",
        accepted_contract_total_cents: totalCents,
        accepted_scope_snapshot: snapshot,
        signature_status: "signed",
        signed_by_name: String(body.signature_name).trim(),
        signed_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        project_activation_status: "awaiting_deposit",
      });
      await writeAudit(svc, {
        entity_type: "Proposal",
        entity_id: proposal.id,
        action: "proposal_accepted",
        source: "api",
        before_value: { status: proposal.status },
        after_value: { total_cents: totalCents, deposit_cents: depositAmt },
      });

      // Idempotent: one installment set per signed proposal
      let installments = await svc.entities.PaymentInstallment.filter(
        { proposal_id: proposal.id },
        "sort_order",
        20
      );
      if (!installments || !installments.length) {
        installments = await svc.entities.PaymentInstallment.bulkCreate(
          buildInstallmentDrafts(proposal, totalCents, depositAmt)
        );
      }
      const depositInstallment = (installments || []).find((i) => i.installment_type === "deposit");
      if (!depositInstallment) {
        return Response.json({ error: "installment_error" }, { status: 500 });
      }

      const { url, session_id } = await createCheckout(svc, req, proposal, depositInstallment, depositAmt);
      await svc.entities.PaymentInstallment.update(depositInstallment.id, {
        stripe_checkout_session_id: session_id,
        payment_link_url: url,
        status: "checkout_opened",
      });
      await svc.entities.Proposal.update(proposal.id, { status: "deposit_checkout_opened" });

      return Response.json({
        accepted: true,
        checkout_url: url,
        total_cents: totalCents,
        deposit_cents: depositAmt,
      });
    }

    // Re-open deposit checkout after a cancelled/incomplete payment
    if (action === "checkout") {
      const g = await gateFor(base44, svc, body.token);
      if (g.error) return Response.json({ error: g.error }, { status: g.status });
      const proposal = g.proposal;
      if (!["accepted_awaiting_deposit", "deposit_checkout_opened"].includes(proposal.status)) {
        return Response.json({ error: "not_available" }, { status: 400 });
      }
      const installments = await svc.entities.PaymentInstallment.filter(
        { proposal_id: proposal.id },
        "sort_order",
        20
      );
      const deposit = (installments || []).find((i) => i.installment_type === "deposit");
      if (!deposit) return Response.json({ error: "not_available" }, { status: 400 });
      if (deposit.status === "paid") return Response.json({ paid: true });
      const { url, session_id } = await createCheckout(svc, req, proposal, deposit, deposit.amount_cents);
      await svc.entities.PaymentInstallment.update(deposit.id, {
        stripe_checkout_session_id: session_id,
        payment_link_url: url,
        status: "checkout_opened",
      });
      await svc.entities.Proposal.update(proposal.id, { status: "deposit_checkout_opened" });
      return Response.json({ checkout_url: url });
    }

    // Confirmation-page polling — has the verified webhook landed yet?
    if (action === "status") {
      const g = await gateFor(base44, svc, body.token);
      if (g.error) return Response.json({ error: g.error }, { status: g.status });
      const proposal = g.proposal;
      return Response.json({
        status: proposal.status,
        project_activation_status: proposal.project_activation_status,
      });
    }

    // Admin-only: email the client an invitation to review the proposal.
    // The draft is left editable until the admin explicitly sends it.
    if (action === "send") {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") {
        return Response.json({ error: "forbidden" }, { status: 403 });
      }
      const proposal = await svc.entities.Proposal.get(body.proposal_id).catch(() => null);
      if (!proposal) return Response.json({ error: "not_found" }, { status: 404 });
      if (!proposal.share_token) {
        return Response.json({ error: "no_share_token" }, { status: 400 });
      }
      if (["accepted_awaiting_deposit", "deposit_checkout_opened", "deposit_paid"].includes(proposal.status)) {
        return Response.json({ error: "already_accepted" }, { status: 400 });
      }
      const client = await svc.entities.AgencyClient.get(proposal.client_id).catch(() => null);
      const to = client?.primary_contact_email || "";
      if (!to) {
        return Response.json({ error: "no_recipient_email" }, { status: 400 });
      }
      const origin = req.headers.get("origin") || FALLBACK_ORIGIN;
      await svc.integrations.Core.SendEmail({
        to,
        template_name: "ProposalReady",
        variables: {
          first_name: (client?.primary_contact_name || "").split(" ")[0] || "there",
          company_name: client?.company_name || proposal.title,
          proposal_url: `${origin}/p/${proposal.share_token}`,
        },
      }).catch((e) => console.error("proposal invitation email failed", e.message));
      const update = { sent_at: new Date().toISOString() };
      if (!["sent", "viewed", "selections_in_progress"].includes(proposal.status)) {
        update.status = "sent";
      }
      await svc.entities.Proposal.update(proposal.id, update);
      await writeAudit(svc, {
        actor: user.email,
        actor_role: "admin",
        entity_type: "Proposal",
        entity_id: proposal.id,
        action: "proposal_sent",
        source: "admin_ui",
        before_value: { status: proposal.status },
      });
      return Response.json({ ok: true });
    }

    // Admin-only manual override: verify a deposit taken outside Stripe
    // (check, transfer) and trigger activation exactly once.
    if (action === "admin-activate") {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") {
        return Response.json({ error: "forbidden" }, { status: 403 });
      }
      const proposal = await svc.entities.Proposal.get(body.proposal_id).catch(() => null);
      if (!proposal) return Response.json({ error: "not_found" }, { status: 404 });
      const installments = await svc.entities.PaymentInstallment.filter(
        { proposal_id: proposal.id },
        "sort_order",
        20
      );
      const deposit = (installments || []).find((i) => i.installment_type === "deposit");
      if (!deposit) return Response.json({ error: "no_deposit_installment" }, { status: 400 });
      await writeAudit(svc, {
        actor: user.email,
        actor_role: "admin",
        entity_type: "Proposal",
        entity_id: proposal.id,
        action: "admin_deposit_override",
        source: "admin_override",
        before_value: { installment_status: deposit.status },
      });
      const result = await handleDepositPaid(svc, {
        proposal_id: proposal.id,
        installment_id: deposit.id,
        amount_paid_cents: deposit.amount_cents,
        source: "admin_override",
        actor: user.email,
      });
      return Response.json(result);
    }

    return Response.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    console.error("agency-proposals error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}