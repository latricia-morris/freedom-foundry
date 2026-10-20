import Stripe from "npm:stripe@17.0.0";
import { secrets } from "base44:runtime";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { handleDepositPaid, writeAudit } from "../../shared/agency/core.ts";
import { applyPaidSession } from "../../shared/brandAudit.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return Response.json({ error: "No signature header" }, { status: 400 });
    }

    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      secrets.get("STRIPE_WEBHOOK_SECRET")
    );

    console.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(`Checkout completed: ${session.id}, customer: ${session.customer}`);
        if (session.metadata?.base44_test_checkout === "true") break;
        if (["brand_audit", "action_strategy"].includes(session.metadata?.payment_type)) {
          const result = await applyPaidSession(createClientFromRequest(req).asServiceRole, session);
          console.log(`Brand audit payment: ${JSON.stringify(result)}`);
        }
        // Proposal microsite deposit: verified server-side, no auto-activation.
        if (session.metadata?.payment_type === "proposal_deposit" && session.metadata?.base44_proposal_id) {
          const base44 = createClientFromRequest(req).asServiceRole;
          const proposalId = session.metadata.base44_proposal_id;
          const installmentId = session.metadata.base44_installment_id;
          const amountPaid = session.amount_total || 0;
          const installment = await base44.entities.PaymentInstallment.get(installmentId).catch(() => null);
          const doc = await base44.entities.ProposalDoc.get(proposalId).catch(() => null);
          if (installment && doc) {
            if (installment.status === "paid" && installment.verification_status === "verified") {
              console.log("Proposal deposit already processed, ignoring replay.");
            } else if (amountPaid !== installment.amount_cents) {
              await base44.entities.PaymentInstallment.update(installment.id, {
                status: "manual_review",
                verification_status: "mismatch",
                amount_paid_cents: amountPaid,
              });
              await writeAudit(base44, {
                entity_type: "PaymentInstallment",
                entity_id: installment.id,
                action: "payment_amount_mismatch",
                source: "stripe_webhook",
                after_value: { expected_cents: installment.amount_cents, received_cents: amountPaid },
              });
            } else {
              await base44.entities.PaymentInstallment.update(installment.id, {
                status: "paid",
                verification_status: "verified",
                amount_paid_cents: amountPaid,
                paid_at: new Date().toISOString(),
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : "",
                external_payment_event_id: event.id,
              });
              await base44.entities.ProposalDoc.update(doc.id, {
                status: "deposit_paid",
                project_activation_status: "ready",
              });
              await writeAudit(base44, {
                entity_type: "PaymentInstallment",
                entity_id: installment.id,
                action: "deposit_paid_verified",
                source: "stripe_webhook",
                after_value: { amount_cents: amountPaid, event_id: event.id },
              });
              const admins = await base44.entities.User.filter({ role: "admin" }, "created_date", 5);
              const adminEmail = (admins || []).find((u) => u.email)?.email;
              if (adminEmail) {
                await base44.integrations.Core.SendEmail({
                  to: adminEmail,
                  subject: `Deposit received — ${doc.title}`,
                  body: `Deposit of $${(amountPaid / 100).toFixed(2)} verified for ${doc.title} (version ${doc.version}). Remaining balance: $${(((doc.signing?.total_cents || amountPaid) - amountPaid) / 100).toFixed(2)}.`,
                }).catch((e) => console.error("admin email failed", e.message));
              }
            }
          }
        }
        // Agency OS deposit payment: verified server-side activation.
        if (session.metadata?.payment_type === "deposit" && session.metadata?.base44_proposal_id) {
          const base44 = createClientFromRequest(req).asServiceRole;
          const result = await handleDepositPaid(base44, {
            proposal_id: session.metadata.base44_proposal_id,
            installment_id: session.metadata.base44_installment_id,
            amount_paid_cents: session.amount_total || 0,
            event_id: event.id,
            session_id: session.id,
            payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : "",
            source: "stripe_webhook",
          });
          console.log(`Agency deposit handling: ${JSON.stringify(result)}`);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log(`Subscription updated: ${sub.id}, status: ${sub.status}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        console.log(`Subscription deleted: ${sub.id}`);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        console.log(`Invoice paid: ${invoice.id}`);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}