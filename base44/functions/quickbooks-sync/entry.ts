import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// QuickBooks sync — PULL ONLY. Never writes to QuickBooks.
// Pulls customers, invoices, and payments; upserts AgencyClient links and
// ClientBillingRecord history idempotently.
// Auth: manual runs require an admin; the scheduled workflow arrives without
// a user (rejected only if an authenticated non-admin invokes it).
// First pull: if no client is linked to QuickBooks yet, all customers are
// imported as new clients. Later pulls link by email, then by QuickBooks id.

function toCents(value) {
  return Math.round((Number(value) || 0) * 100);
}

function isoDate(value) {
  return value ? String(value).slice(0, 10) : null;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const svc = base44.asServiceRole;

    const { accessToken, connectionConfig } = await svc.connectors.getConnection('quickbooks');
    const realmId = connectionConfig && connectionConfig.realmId;
    if (!realmId) {
      return Response.json({ error: 'QuickBooks connection is missing its company (realm) id.' }, { status: 400 });
    }

    // ── Pull entities from QuickBooks (read-only query endpoint) ──
    const qbQuery = async (entity) => {
      const rows = [];
      let start = 1;
      const pageSize = 1000;
      while (true) {
        const stmt = encodeURIComponent(`select * from ${entity} STARTPOSITION ${start} MAXRESULTS ${pageSize}`);
        const res = await fetch(
          `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${stmt}`,
          { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
        );
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`QuickBooks ${entity} query failed (${res.status}): ${errText.slice(0, 200)}`);
        }
        const body = await res.json();
        const page = (body.QueryResponse && body.QueryResponse[entity]) || [];
        rows.push(...page);
        if (page.length < pageSize) break;
        start += pageSize;
      }
      return rows;
    };

    const [customers, invoices, payments] = await Promise.all([
      qbQuery('Customer'),
      qbQuery('Invoice'),
      qbQuery('Payment'),
    ]);

    // ── Link or create agency clients ──
    const existingClients = (await svc.entities.AgencyClient.filter({}, '-created_date', 500)) || [];
    const firstPull = !existingClients.some((c) => c.quickbooks_customer_id);
    const byQbId = new Map(
      existingClients.filter((c) => c.quickbooks_customer_id).map((c) => [c.quickbooks_customer_id, c])
    );
    const byEmail = new Map(
      existingClients
        .filter((c) => c.primary_contact_email)
        .map((c) => [c.primary_contact_email.toLowerCase(), c])
    );

    let linked = 0;
    let created = 0;
    const newClients = [];
    const clientPatches = [];
    const seenClientIds = new Set();

    for (const cust of customers) {
      const qbId = String(cust.Id);
      const email = ((cust.PrimaryEmailAddr && cust.PrimaryEmailAddr.Address) || '').toLowerCase();
      const displayName = cust.DisplayName || cust.CompanyName || `Customer ${qbId}`;
      const contactName = [cust.GivenName, cust.FamilyName].filter(Boolean).join(' ') || displayName;
      const phone = (cust.PrimaryPhone && cust.PrimaryPhone.FreeNum) || '';

      let client = byQbId.get(qbId);
      if (!client && email) client = byEmail.get(email);
      if (client) {
        linked += 1;
        seenClientIds.add(client.id);
        // Pull-only: fill empty fields, never overwrite admin-entered data.
        const patch = {};
        if (!client.quickbooks_customer_id) patch.quickbooks_customer_id = qbId;
        if (!client.primary_contact_name && contactName) patch.primary_contact_name = contactName;
        if (!client.primary_contact_email && email) patch.primary_contact_email = email;
        if (!client.primary_contact_phone && phone) patch.primary_contact_phone = phone;
        if (Object.keys(patch).length) {
          clientPatches.push({ id: client.id, ...patch });
          Object.assign(client, patch);
        }
      } else {
        created += 1;
        newClients.push({
          company_name: cust.CompanyName || displayName,
          primary_contact_name: contactName,
          primary_contact_email: email,
          primary_contact_phone: phone,
          status: cust.Active === false ? 'inactive' : 'active',
          quickbooks_customer_id: qbId,
          notes: 'Imported from QuickBooks.',
        });
      }
    }

    if (clientPatches.length) {
      for (let i = 0; i < clientPatches.length; i += 500) {
        await svc.entities.AgencyClient.bulkUpdate(clientPatches.slice(i, i + 500));
      }
    }
    if (newClients.length) {
      await svc.entities.AgencyClient.bulkCreate(newClients);
    }

    // Rebuild the QuickBooks customer id -> client id map after creates.
    const allClients = (await svc.entities.AgencyClient.filter({}, '-created_date', 500)) || [];
    const clientIdByQbId = new Map(
      allClients.filter((c) => c.quickbooks_customer_id).map((c) => [c.quickbooks_customer_id, c.id])
    );

    // ── Upsert billing history idempotently ──
    const existingRecords = (await svc.entities.ClientBillingRecord.filter({}, '-created_date', 1000)) || [];
    const recKey = (r) => `${r.record_type}:${r.quickbooks_txn_id}`;
    const recByQb = new Map(existingRecords.map((r) => [recKey(r), r]));
    const nowISO = new Date().toISOString();
    const creates = [];
    const updates = [];

    const addBilling = (customerRefValue, type, txn) => {
      const qbId = customerRefValue == null ? null : String(customerRefValue);
      if (!qbId) return;
      const clientId = clientIdByQbId.get(qbId);
      if (!clientId) return;
      const key = `${type}:${String(txn.Id)}`;
      const amountCents = toCents(txn.TotalAmt);
      const balanceCents = type === 'invoice' ? toCents(txn.Balance) : 0;
      const row = {
        agency_client_id: clientId,
        quickbooks_customer_id: qbId,
        record_type: type,
        quickbooks_txn_id: String(txn.Id),
        doc_number: txn.DocNumber || txn.PaymentRefNum || '',
        txn_date: isoDate(txn.TxnDate),
        due_date: type === 'invoice' ? isoDate(txn.DueDate) : null,
        amount_cents: amountCents,
        balance_cents: balanceCents,
        currency: (txn.CurrencyRef && txn.CurrencyRef.value) || 'USD',
        status: type === 'payment' ? 'paid' : balanceCents <= 0 ? 'paid' : 'open',
        description: type === 'payment' ? 'Payment received' : ((txn.CustomerMemo && txn.CustomerMemo.value) || ''),
        synced_at: nowISO,
      };
      const existing = recByQb.get(key);
      if (existing) {
        const changed = [
          'agency_client_id', 'doc_number', 'txn_date', 'due_date',
          'amount_cents', 'balance_cents', 'currency', 'status', 'description',
        ].some((f) => JSON.stringify(existing[f]) !== JSON.stringify(row[f]));
        if (changed) updates.push({ id: existing.id, ...row });
      } else {
        creates.push(row);
      }
    };

    for (const inv of invoices) addBilling(inv.CustomerRef && inv.CustomerRef.value, 'invoice', inv);
    for (const pay of payments) addBilling(pay.CustomerRef && pay.CustomerRef.value, 'payment', pay);

    if (creates.length) await svc.entities.ClientBillingRecord.bulkCreate(creates);
    for (let i = 0; i < updates.length; i += 500) {
      await svc.entities.ClientBillingRecord.bulkUpdate(updates.slice(i, i + 500));
    }

    const summary = {
      customers_total: customers.length,
      linked,
      created,
      invoices: invoices.length,
      payments: payments.length,
      billing_records: creates.length + updates.length,
      first_pull: firstPull,
    };

    await svc.entities.AuditLog.create({
      actor: user ? user.email : 'system',
      actor_role: user ? 'admin' : 'system',
      entity_type: 'QuickBooksSync',
      entity_id: realmId,
      action: 'quickbooks_sync_completed',
      source: user ? 'ui' : 'automation',
      after_value: summary,
    }).catch(() => {});

    return Response.json({ ok: true, ...summary });
  } catch (error) {
    console.error('quickbooks-sync failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}