import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import Stripe from "npm:stripe@17.0.0";
import { secrets } from "base44:runtime";
import { memberBrands } from "../../shared/portal/memberBrands.ts";
import { OFFERS, TERMS_VERSION, ACTIVE, applyPaidSession } from "../../shared/brandAudit.ts";

const own = async (E, uid) => {
  const [a, b] = await Promise.all([
    E.filter({ user_id: uid }, { limit: 20 }).catch(() => ({ items: [] })),
    E.filter({ created_by_id: uid }, { limit: 20 }).catch(() => ({ items: [] })),
  ]);
  const seen = new Set();
  return [...(a.items || []), ...(b.items || [])].filter((r) => !seen.has(r.id) && seen.add(r.id));
};
const linksOf = (p) => [p?.website && { label: "Website", url: p.website },
  ...((p?.social_channels || p?.social_links || []).filter((s) => s?.url).map((s) => ({ label: s.platform || "Profile", url: s.url })))].filter(Boolean);

async function brandsFor(db, user) {
  const [clients, corp, pers] = await Promise.all([
    memberBrands({ asServiceRole: db }, user),
    own(db.entities.CorporateBrandProfile, user.id),
    own(db.entities.PersonalBrandProfile, user.id),
  ]);
  const list = clients.map((c) => ({ key: `client:${c.id}`, label: c.company_name, agency_client_id: c.id }));
  for (const p of corp) if (!list.some((b) => b.agency_client_id && b.agency_client_id === p.agency_client_id))
    list.push({ key: `corporate:${p.id}`, label: p.company_name || "Corporate brand", agency_client_id: p.agency_client_id || "" });
  for (const p of pers) list.push({ key: `personal:${p.id}`, label: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.business_name || "Personal brand" });
  if (!list.length) list.push({ key: `user:${user.id}`, label: user.full_name || "My brand" });
  return { list, corp, pers };
}

async function prefill(db, user, brand, corp, pers) {
  const [kind, id] = brand.key.split(":");
  let p = kind === "corporate" ? corp.find((x) => x.id === id) : kind === "personal" ? pers.find((x) => x.id === id) : null;
  if (kind === "client") p = corp.find((x) => x.agency_client_id === id) || corp[0] || null;
  const client = brand.agency_client_id ? await db.entities.AgencyClient.get(brand.agency_client_id).catch(() => null) : null;
  const links = linksOf(p);
  return {
    brand_name: brand.label, website: p?.website || "", links: links.filter((l) => l.label !== "Website"),
    contact_name: user.full_name || client?.primary_contact_name || "", contact_email: user.email,
    contact_phone: p?.phone || client?.primary_contact_phone || "", context: "",
  };
}

async function legacyReleased(db, clientId) {
  if (!clientId) return false;
  const [a, v] = await Promise.all([
    db.entities.BrandHealthAudit.count({ agency_client_id: clientId, status: "published_to_client" }).catch(() => 0),
    db.entities.VisibilityReport.count({ agency_client_id: clientId, verification_status: "human_reviewed" }).catch(() => 0),
  ]);
  return a + v > 0;
}

const forClient = (r) => {
  if (!r) return null;
  const { admin_notes, released_by, strategy_released_by, reminders_paused, ...rest } = r;
  if (r.strategy_status === "hidden" || !r.strategy_status) { delete rest.strategy_status; delete rest.strategy_url; delete rest.strategy_session_id; }
  if (r.status !== "released") { delete rest.report_path; }
  if (r.strategy_status !== "delivered") delete rest.strategy_url;
  return rest;
};

function origin(req) {
  const o = req.headers.get("X-Base44-App-Url");
  if (!o) throw new Error("App URL header missing; cannot create checkout.");
  return o.replace(/\/$/, "");
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const db = base44.asServiceRole;
    const R = db.entities.BrandAuditRequest;
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const stripe = () => new Stripe(secrets.get("STRIPE_SECRET_KEY"));

    // ---------- admin ----------
    if (action?.startsWith("admin_")) {
      if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
      const now = new Date().toISOString();
      if (action === "admin_list") {
        const q = body.status ? { status: body.status } : { status: { $ne: "draft" } };
        const page = await R.filter(q, { sort: "-updated_date", limit: 100 });
        return Response.json({ items: page.items });
      }
      const r = await R.get(body.id);
      if (action === "admin_update") {
        const allowed = ["status", "call_scheduled_at", "admin_notes", "report_path", "reminders_paused"];
        const patch = Object.fromEntries(Object.entries(body.patch || {}).filter(([k]) => allowed.includes(k)));
        if (patch.status === "released") return Response.json({ error: "Use the release action." }, { status: 400 });
        return Response.json({ item: await R.update(r.id, patch) });
      }
      if (action === "admin_call_completed")
        return Response.json({ item: await R.update(r.id, { call_completed_at: now, status: r.status === "released" ? "released" : "call_completed" }) });
      if (action === "admin_release") {
        if (!r.call_completed_at) return Response.json({ error: "Mark the findings call completed first." }, { status: 400 });
        return Response.json({ item: await R.update(r.id, { status: "released", released_at: now, released_by: user.email, report_path: r.report_path || "/brand-portal/brand-health" }) });
      }
      if (action === "admin_release_strategy") {
        if (r.tier !== "courtesy") return Response.json({ error: "The Action Strategy is only offered to courtesy clients." }, { status: 400 });
        if (!r.call_completed_at) return Response.json({ error: "Mark the findings call completed first." }, { status: 400 });
        if (r.strategy_status && r.strategy_status !== "hidden") return Response.json({ item: r });
        return Response.json({ item: await R.update(r.id, { strategy_status: "available", strategy_released_at: now, strategy_released_by: user.email }) });
      }
      if (action === "admin_deliver_strategy") {
        if (r.strategy_status !== "preparing") return Response.json({ error: "Strategy has not been paid." }, { status: 400 });
        return Response.json({ item: await R.update(r.id, { strategy_status: "delivered", strategy_url: body.url || "" }) });
      }
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    // ---------- client ----------
    const { list, corp, pers } = await brandsFor(db, user);
    const brand = list.find((b) => b.key === body.brand_key) || list[0];
    const mine = (await R.filter({ user_id: user.id, brand_key: brand.key, status: { $ne: "cancelled" } }, { sort: "-created_date", limit: 5 })).items;
    let current = mine[0] || null;
    const now = new Date().toISOString();

    if (action === "state") {
      const legacy = !current && (await legacyReleased(db, brand.agency_client_id));
      return Response.json({ brands: list.map(({ key, label }) => ({ key, label })), brand: { key: brand.key, label: brand.label }, request: forClient(current), legacy_released: legacy, prefill: current?.details || (await prefill(db, user, brand, corp, pers)) });
    }

    const editable = current && (current.status === "draft" || (current.status === "awaiting_payment" && current.payment_status !== "paid"));

    if (action === "save") {
      if (current && !editable) return Response.json({ request: forClient(current) });
      const patch = { last_activity_at: now };
      if (body.tier !== undefined) patch.tier = body.tier;
      if (body.stage) patch.stage = body.stage;
      if (body.details) patch.details = body.details;
      if (current) {
        if (current.status === "awaiting_payment" && body.tier && body.tier !== current.tier) Object.assign(patch, { status: "draft", payment_status: "none", stripe_session_id: "" });
        current = await R.update(current.id, patch);
      } else {
        const details = body.details || (await prefill(db, user, brand, corp, pers));
        current = await R.create({ user_id: user.id, user_email: user.email, brand_key: brand.key, brand_label: brand.label, agency_client_id: brand.agency_client_id || "", status: "draft", payment_status: "none", strategy_status: "hidden", stage: "offers", ...patch, details });
      }
      return Response.json({ request: forClient(current) });
    }

    const validDetails = (d, tier) => {
      const urls = [d?.website, ...((d?.links || []).map((l) => l.url))].filter((u) => typeof u === "string" && u.trim());
      if (!d?.brand_name?.trim()) return "Add your brand or professional name.";
      if (!urls.length && !d?.needs_help) return "Add at least one public link, or tell us you need help finding one.";
      if (tier !== "courtesy" && !d?.website?.trim()) return "A website address is required for this review.";
      return null;
    };

    if (action === "submit_courtesy") {
      if (!current || !editable) return Response.json({ request: forClient(current) });
      const err = validDetails(body.details, "courtesy");
      if (err) return Response.json({ error: err }, { status: 400 });
      current = await R.update(current.id, { tier: "courtesy", details: body.details, snapshot_at: now, submitted_at: now, status: "submitted", stage: "review", payment_status: "none", last_activity_at: now });
      const admins = await db.entities.User.filter({ role: "admin" }).catch(() => []);
      const adminEmail = (admins || []).find((u) => u.email)?.email;
      if (adminEmail) await db.integrations.Core.SendEmail({ to: adminEmail, subject: `New courtesy Brand Health request: ${brand.label}`, body: `${user.email} requested the courtesy Visibility & Credibility report for ${brand.label}. Review it in Admin → Brand Reviews.` }).catch((e) => console.error("admin email", e.message));
      return Response.json({ request: forClient(current) });
    }

    if (action === "checkout") {
      if (!current || !editable) return Response.json({ request: forClient(current) });
      const tier = current.tier;
      const offer = OFFERS[tier];
      if (!offer || tier === "strategy") return Response.json({ error: "Choose a paid review first." }, { status: 400 });
      const err = validDetails(body.details, tier);
      if (err) return Response.json({ error: err }, { status: 400 });
      if (!body.terms_accepted) return Response.json({ error: "Please confirm the purchased scope and non-refundable policy." }, { status: 400 });
      const s = stripe();
      if (current.stripe_session_id) {
        const old = await s.checkout.sessions.retrieve(current.stripe_session_id).catch(() => null);
        if (old?.payment_status === "paid") { await applyPaidSession(db, old); return Response.json({ request: forClient(await R.get(current.id)) }); }
        if (old?.status === "open" && old.amount_total === offer.cents) {
          await R.update(current.id, { details: body.details, snapshot_at: now });
          return Response.json({ url: old.url });
        }
      }
      const o = origin(req);
      const session = await s.checkout.sessions.create({
        mode: "payment", line_items: [{ price: offer.price, quantity: 1 }], customer_email: user.email,
        success_url: `${o}/brand-review?session_id={CHECKOUT_SESSION_ID}&brand=${encodeURIComponent(brand.key)}`,
        cancel_url: `${o}/brand-review?canceled=1&brand=${encodeURIComponent(brand.key)}`,
        metadata: { base44_app_id: secrets.get("BASE44_APP_ID"), payment_type: "brand_audit", brand_audit_request_id: current.id, tier },
      });
      await R.update(current.id, { status: "awaiting_payment", payment_status: "pending", stripe_session_id: session.id, amount_cents: offer.cents, details: body.details, snapshot_at: now, terms_version: TERMS_VERSION, terms_accepted_at: now, stage: "review", last_activity_at: now });
      return Response.json({ url: session.url });
    }

    if (action === "verify") {
      const target = (await R.filter({ user_id: user.id, $or: [{ stripe_session_id: body.session_id }, { strategy_session_id: body.session_id }] }, { limit: 1 })).items[0];
      if (!target) return Response.json({ error: "Order not found." }, { status: 404 });
      const session = await stripe().checkout.sessions.retrieve(body.session_id, { expand: ["payment_intent.latest_charge"] });
      const result = await applyPaidSession(db, session);
      if (result.ok && session.metadata?.payment_type === "brand_audit") {
        const receipt = session.payment_intent?.latest_charge?.receipt_url;
        if (receipt) await R.update(target.id, { receipt_url: receipt });
      }
      if (!result.ok && session.status === "expired") await R.update(target.id, { payment_status: "expired" });
      return Response.json({ paid: result.ok, status: session.payment_status, request: forClient(await R.get(target.id)) });
    }

    if (action === "strategy_checkout") {
      if (!current || current.tier !== "courtesy" || !["available", "awaiting_payment"].includes(current.strategy_status)) return Response.json({ error: "Not available." }, { status: 404 });
      if (!body.terms_accepted) return Response.json({ error: "Please confirm the non-refundable policy." }, { status: 400 });
      const o = origin(req);
      const session = await stripe().checkout.sessions.create({
        mode: "payment", line_items: [{ price: OFFERS.strategy.price, quantity: 1 }], customer_email: user.email,
        success_url: `${o}/brand-review?session_id={CHECKOUT_SESSION_ID}&brand=${encodeURIComponent(brand.key)}`,
        cancel_url: `${o}/dashboard`,
        metadata: { base44_app_id: secrets.get("BASE44_APP_ID"), payment_type: "action_strategy", brand_audit_request_id: current.id },
      });
      await R.update(current.id, { strategy_status: "awaiting_payment", strategy_session_id: session.id });
      return Response.json({ url: session.url });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("brandAudit error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}