import Stripe from "npm:stripe@17.0.0";
import { secrets } from "base44:runtime";

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { price_id, mode } = body;

    if (!price_id) {
      return Response.json({ error: "price_id is required" }, { status: 400 });
    }

    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const origin = req.headers.get("origin") || "https://freedomfoundry.vip";

    const session = await stripe.checkout.sessions.create({
      mode: mode || "subscription",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${origin}/billing?status=success`,
      cancel_url: `${origin}/billing?status=cancelled`,
      metadata: {
        base44_app_id: secrets.get("BASE44_APP_ID"),
      },
    });

    console.log(`Checkout session created: ${session.id}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}