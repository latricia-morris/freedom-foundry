// Shared Stripe deposit checkout for agency proposals and proposal microsites.
import { secrets } from "base44:runtime";

export const PROPOSAL_FALLBACK_ORIGIN = "https://brand-forge-vault.base44.app";

export async function createDepositCheckout(req, stripe, cfg) {
  const origin = req.headers.get("origin") || cfg.fallbackOrigin || PROPOSAL_FALLBACK_ORIGIN;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    managed_payments: { enabled: false },
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: cfg.amountCents,
        product_data: { name: cfg.productName },
      },
      quantity: 1,
    }],
    client_reference_id: cfg.proposalId,
    metadata: {
      base44_app_id: secrets.get("BASE44_APP_ID"),
      ...cfg.metadata,
    },
    success_url: `${origin}${cfg.successPath}`,
    cancel_url: `${origin}${cfg.cancelPath}`,
  });
  console.log(`Deposit checkout session created: ${session.id}`);
  return { url: session.url, session_id: session.id };
}