// Server-controlled Brand Health audit offers. Browser amounts are never trusted.
export const OFFERS = {
  website: { name: "Website Discoverability & Conversion Readiness", cents: 69700, price: "price_1USgGOBhKwIjtr35sl9a3o33" },
  complete: { name: "Complete Brand Health Review", cents: 149700, price: "price_1USgGPBhKwIjtr35WVVaXDni" },
  strategy: { name: "Written Action Strategy", cents: 9700, price: "price_1USgGPBhKwIjtr352zEakiLr" },
};
export const TERMS_VERSION = "2026-10-20";
export const ACTIVE = ["submitted", "information_needed", "queued", "in_review", "ready_for_call", "call_completed"];

/** Idempotently records a verified paid checkout session against its request. */
export async function applyPaidSession(db, session) {
  const id = session.metadata?.brand_audit_request_id;
  const kind = session.metadata?.payment_type;
  if (!id || session.payment_status !== "paid") return { ok: false, reason: "not_paid" };
  const r = await db.entities.BrandAuditRequest.get(id).catch(() => null);
  if (!r) return { ok: false, reason: "missing" };
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "";
  if (kind === "action_strategy") {
    if (r.strategy_session_id !== session.id) return { ok: false, reason: "session_mismatch" };
    if (session.amount_total !== OFFERS.strategy.cents) return { ok: false, reason: "amount_mismatch" };
    if (r.strategy_status === "awaiting_payment" || r.strategy_status === "available") {
      await db.entities.BrandAuditRequest.update(r.id, { strategy_status: "preparing", strategy_paid_at: new Date().toISOString() });
    }
    return { ok: true };
  }
  if (kind !== "brand_audit") return { ok: false, reason: "kind" };
  if (r.payment_status === "paid") return { ok: true, already: true };
  if (r.stripe_session_id !== session.id) return { ok: false, reason: "session_mismatch" };
  const offer = OFFERS[r.tier];
  if (!offer || session.amount_total !== offer.cents || session.currency !== "usd") {
    await db.entities.BrandAuditRequest.update(r.id, { admin_notes: `${r.admin_notes || ""}\nPayment amount mismatch on ${session.id}`.trim() });
    return { ok: false, reason: "amount_mismatch" };
  }
  const now = new Date().toISOString();
  await db.entities.BrandAuditRequest.update(r.id, {
    payment_status: "paid", status: "submitted", paid_at: now, submitted_at: now,
    stripe_payment_intent_id: pi, amount_cents: session.amount_total,
  });
  return { ok: true };
}