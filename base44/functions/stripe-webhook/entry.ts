import Stripe from "npm:stripe@17.0.0";
import { secrets } from "base44:runtime";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { handleDepositPaid } from "../../shared/agency/core.ts";

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