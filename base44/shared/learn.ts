// Academy (courses and books): access rules, Stripe product sync and
// payment confirmation shared by the learner, admin and webhook functions.

export const rows = (r) => r?.items || r || [];

export const getOrNull = (entity, id) =>
  entity.get(id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));

export const isPaid = (o) => !o.is_free && (o.price_cents || 0) > 0;

/** Admins always have access; everyone else needs an active entitlement. */
export async function hasAccess(db, user, offeringId) {
  if (user.role === 'admin') return true;
  const found = rows(await db.LearnEntitlement.filter({ offering_id: offeringId, user_id: user.id, status: 'active' }, '-created_date', 1));
  return found.length > 0;
}

/**
 * Makes the Stripe product and price match the offering. Stripe prices cannot
 * be edited, so a price change creates a new price and retires the old one.
 */
export async function syncOfferingToStripe(stripe, db, o, appId) {
  const paid = isPaid(o);
  let productId = o.stripe_product_id;
  let priceId = o.stripe_price_id;
  if (!productId && !paid) return o;

  const productData = {
    name: o.title,
    active: o.status !== 'archived',
    ...(o.description ? { description: o.description.slice(0, 500) } : {}),
    ...(o.thumbnail_url ? { images: [o.thumbnail_url] } : {}),
  };
  const metadata = { base44_app_id: appId, learn_offering_id: o.id };

  if (!productId) {
    const product = await stripe.products.create({ ...productData, metadata }, { idempotencyKey: `learn-product-${o.id}` });
    productId = product.id;
    await db.LearnOffering.update(o.id, { stripe_product_id: productId });
  } else {
    await stripe.products.update(productId, productData);
  }

  if (paid && (!priceId || o.stripe_price_cents !== o.price_cents)) {
    const price = await stripe.prices.create(
      { product: productId, unit_amount: o.price_cents, currency: o.currency || 'usd', metadata },
      { idempotencyKey: `learn-price-${o.id}-${o.price_cents}-${priceId || 'new'}` },
    );
    await stripe.products.update(productId, { default_price: price.id });
    if (priceId) await stripe.prices.update(priceId, { active: false });
    priceId = price.id;
  }
  if (!paid && priceId) {
    await stripe.products.update(productId, { default_price: '' });
    await stripe.prices.update(priceId, { active: false });
    priceId = '';
  }

  return db.LearnOffering.update(o.id, {
    stripe_product_id: productId,
    stripe_price_id: priceId || '',
    stripe_price_cents: paid ? o.price_cents : 0,
    stripe_synced_at: new Date().toISOString(),
  });
}

/** Grants access for a verified, fully paid checkout session whose amount matches what was recorded. */
export async function applyLearnPayment(db, session) {
  if (session.payment_status !== 'paid') return { ok: false, reason: 'not_paid' };
  const found = rows(await db.LearnEntitlement.filter({ stripe_session_id: session.id }, '-created_date', 1));
  const ent = found[0];
  if (!ent) return { ok: false, reason: 'no_pending_purchase' };
  if (ent.status === 'active') return { ok: true, reason: 'already_active' };
  const amount = session.amount_total || 0;
  const currencyOk = (session.currency || '').toLowerCase() === (ent.currency || 'usd').toLowerCase();
  if (amount !== ent.expected_amount_cents || !currencyOk) {
    await db.LearnEntitlement.update(ent.id, { status: 'review', amount_paid_cents: amount });
    return { ok: false, reason: 'amount_mismatch' };
  }
  await db.LearnEntitlement.update(ent.id, { status: 'active', amount_paid_cents: amount, paid_at: new Date().toISOString() });
  return { ok: true, reason: 'granted' };
}