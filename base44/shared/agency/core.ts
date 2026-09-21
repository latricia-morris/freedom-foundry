// Agency OS core: money-safe helpers, selection pricing, verified payment
// handling, and idempotent project activation. All money is integer cents.

export function depositCentsFor(totalCents, ruleType, ruleValue) {
  if (!Number.isFinite(totalCents) || totalCents < 0) return 0;
  if (ruleType === "fixed_amount") return Math.max(0, Math.round(ruleValue || 0));
  if (ruleType === "full_payment" || ruleType === "tier_specific") return Math.round(totalCents);
  const pct = Math.min(100, Math.max(0, ruleValue || 0));
  return Math.round((totalCents * pct) / 100);
}

function lineFor(item, quantity) {
  const unit = Math.max(0, Math.round(item.unit_price_cents || 0));
  return {
    line_item_id: item.id,
    title: item.title,
    item_type: item.item_type,
    quantity,
    unit_price_cents: unit,
    line_total_cents: unit * quantity,
    pricing_visible: item.pricing_visible !== false,
    display_order: item.display_order || 0,
  };
}

/** Price a client's selections server-side. Never trust client-sent amounts. */
export function applySelections(items, selections) {
  const lines = [];
  const errors = [];
  const tierGroups = new Map();
  for (const item of items || []) {
    if (item.item_type === "tier" && item.tier_group) {
      if (!tierGroups.has(item.tier_group)) tierGroups.set(item.tier_group, []);
      tierGroups.get(item.tier_group).push(item);
    }
  }
  for (const [group, groupItems] of tierGroups) {
    const chosen = groupItems.find((i) => selections?.[i.id]?.selected);
    const picked = chosen || (groupItems.length === 1 ? groupItems[0] : null);
    if (!picked) errors.push(`Choose an option for ${group}.`);
    else lines.push(lineFor(picked, 1));
  }
  for (const item of items || []) {
    if (item.item_type === "tier") continue;
    if (item.item_type === "required") {
      lines.push(lineFor(item, 1));
      continue;
    }
    if (item.item_type === "quantity_based") {
      const min = item.quantity_min ?? 0;
      const max = item.quantity_max;
      let qty = Number(selections?.[item.id]?.quantity ?? item.default_quantity ?? min);
      if (!Number.isFinite(qty)) qty = min;
      qty = Math.floor(Math.max(min, max != null ? Math.min(max, qty) : qty));
      if (qty > 0) lines.push(lineFor(item, qty));
      continue;
    }
    if (selections?.[item.id]?.selected) lines.push(lineFor(item, 1));
  }
  lines.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  const totalCents = lines.reduce((sum, l) => sum + l.line_total_cents, 0);
  return { lines, totalCents, errors };
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Add N business days (weekends skipped). */
export function addBusinessDays(value, days) {
  const start = toDate(value);
  if (!start) return null;
  let remaining = Math.max(0, Math.floor(days));
  const d = new Date(start);
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return toISODate(d);
}

/** Subtract N business days — the internal-ready buffer before a client due date. */
export function subtractBusinessDays(value, days) {
  const start = toDate(value);
  if (!start) return null;
  let remaining = Math.max(0, Math.floor(days));
  const d = new Date(start);
  while (remaining > 0) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return toISODate(d);
}

/** Deposit + milestone + final installment drafts for an accepted proposal. */
export function buildInstallmentDrafts(proposal, totalCents, depositAmtCents) {
  const nowISO = new Date().toISOString();
  const drafts = [{
    proposal_id: proposal.id,
    client_id: proposal.client_id,
    installment_type: "deposit",
    description: "Project deposit",
    amount_cents: depositAmtCents,
    status: "pending",
    verification_status: "unverified",
    sort_order: 0,
  }];
  let allocated = depositAmtCents;
  (proposal.milestone_rules || []).forEach((rule, i) => {
    const amount = Math.round((totalCents * (rule.percent || 0)) / 100);
    if (amount <= 0) return;
    drafts.push({
      proposal_id: proposal.id,
      client_id: proposal.client_id,
      installment_type: "milestone",
      description: rule.description || "Milestone payment",
      amount_cents: amount,
      status: "pending",
      verification_status: "unverified",
      sort_order: i + 1,
      due_date: addBusinessDays(nowISO, rule.due_days || 30),
    });
    allocated += amount;
  });
  const finalAmount = totalCents - allocated;
  if (finalAmount > 0) {
    drafts.push({
      proposal_id: proposal.id,
      client_id: proposal.client_id,
      installment_type: "final",
      description: "Final payment",
      amount_cents: finalAmount,
      status: "pending",
      verification_status: "unverified",
      sort_order: drafts.length,
      due_date: addBusinessDays(nowISO, 60),
    });
  }
  return drafts;
}

export async function writeAudit(svc, entry) {
  try {
    await svc.entities.AuditLog.create({
      actor: entry.actor || "system",
      actor_role: entry.actor_role || "system",
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      action: entry.action,
      before_value: entry.before_value ?? null,
      after_value: entry.after_value ?? null,
      source: entry.source || "ui",
    });
  } catch (e) {
    console.error("audit write failed", e.message);
  }
}

async function notifyAdminOfException(svc, proposal, message) {
  try {
    const admins = await svc.entities.User.filter({ role: "admin" }, "created_date", 5);
    const email = (admins || []).find((u) => u.email)?.email;
    if (email) {
      await svc.integrations.Core.SendEmail({
        to: email,
        subject: `Payment exception — ${proposal.proposal_number || proposal.title}`,
        body: message,
      });
    }
  } catch (e) {
    console.error("admin notify failed", e.message);
  }
}

/**
 * Verified deposit payment → mark paid, advance the proposal, and activate the
 * project exactly once. Idempotent: replayed events return already_processed.
 * Amount mismatches go to Manual Review and notify only the Primary Admin.
 */
export async function handleDepositPaid(svc, input) {
  const proposal = await svc.entities.Proposal.get(input.proposal_id).catch(() => null);
  const installment = await svc.entities.PaymentInstallment.get(input.installment_id).catch(() => null);
  if (!proposal || !installment) return { ok: false, error: "records_not_found" };

  if (installment.status === "paid" && installment.verification_status === "verified") {
    return { ok: true, already_processed: true };
  }

  const amountPaid = Math.round(input.amount_paid_cents ?? 0);
  if (amountPaid !== installment.amount_cents) {
    await svc.entities.PaymentInstallment.update(installment.id, {
      status: "manual_review",
      verification_status: "mismatch",
      amount_paid_cents: amountPaid,
    });
    await svc.entities.Proposal.update(proposal.id, { project_activation_status: "manual_review" });
    await writeAudit(svc, {
      entity_type: "PaymentInstallment",
      entity_id: installment.id,
      action: "payment_amount_mismatch",
      source: input.source || "stripe_webhook",
      after_value: { expected_cents: installment.amount_cents, received_cents: amountPaid },
    });
    await notifyAdminOfException(
      svc,
      proposal,
      `Deposit amount mismatch on ${proposal.proposal_number || proposal.title}. Expected $${(installment.amount_cents / 100).toFixed(2)}, received $${(amountPaid / 100).toFixed(2)}. The record is in Manual Review.`
    );
    return { ok: false, error: "amount_mismatch" };
  }

  await svc.entities.PaymentInstallment.update(installment.id, {
    status: "paid",
    verification_status: "verified",
    amount_paid_cents: amountPaid,
    paid_at: new Date().toISOString(),
    stripe_checkout_session_id: input.session_id || installment.stripe_checkout_session_id,
    stripe_payment_intent_id: input.payment_intent_id || installment.stripe_payment_intent_id || "",
    external_payment_event_id: input.event_id || "",
  });
  await svc.entities.Proposal.update(proposal.id, {
    status: "deposit_paid",
    project_activation_status: "activated",
  });
  await writeAudit(svc, {
    entity_type: "PaymentInstallment",
    entity_id: installment.id,
    action: "deposit_paid_verified",
    source: input.source || "stripe_webhook",
    after_value: { amount_cents: amountPaid, event_id: input.event_id },
  });

  const project = await activateProjectForProposal(svc, proposal);
  await writeAudit(svc, {
    entity_type: "Proposal",
    entity_id: proposal.id,
    action: "project_activation_complete",
    source: input.source || "stripe_webhook",
    after_value: { project_id: project?.id },
  });
  return { ok: true, project_id: project?.id };
}

/**
 * Create the project from the accepted scope snapshot — never from the live
 * proposal draft. Idempotent on originating_proposal_id.
 */
export async function activateProjectForProposal(svc, proposal) {
  const existing = await svc.entities.Project.filter(
    { originating_proposal_id: proposal.id },
    "-created_date",
    5
  );
  if (existing && existing.length) return existing[0];

  const client = await svc.entities.AgencyClient.get(proposal.client_id).catch(() => null);
  const templates = await svc.entities.ProjectTemplate.filter({ active: true }, "created_date", 50);
  const template =
    (templates || []).find((t) => t.id === proposal.source_template_id) ||
    (templates || []).find((t) => t.is_default) ||
    null;

  const snapshot = proposal.accepted_scope_snapshot || {};
  const scopeLines = snapshot.lines || [];
  const nowISO = new Date().toISOString();
  const bufferDays = template?.internal_buffer_days ?? 4;
  const releaseRule = template?.default_release_rule || "manual";

  const completion = template?.duration_days ? addBusinessDays(nowISO, template.duration_days) : null;

  const project = await svc.entities.Project.create({
    client_id: proposal.client_id,
    originating_proposal_id: proposal.id,
    project_template_id: template?.id || "",
    name: `${client?.company_name || "Client"} — ${proposal.title}`,
    status: "onboarding",
    client_start_date: addBusinessDays(nowISO, 1),
    client_target_completion_date: completion,
    internal_target_completion_date: completion ? subtractBusinessDays(completion, bufferDays) : null,
    client_project_health: "on_track",
    payment_operational_status: "deposit_confirmed",
    assigned_project_manager: client?.assigned_project_manager || "",
    assigned_team_members: [],
    client_portal_enabled: false,
    activated_at: nowISO,
  });

  const taskRows = [];
  const deliverableRows = [];
  let order = 0;
  for (const phase of template?.phases || []) {
    for (const task of phase.tasks || []) {
      const clientDue = task.due_offset_days ? addBusinessDays(nowISO, task.due_offset_days) : null;
      const internalReady = clientDue ? subtractBusinessDays(clientDue, bufferDays) : null;
      const targets = task.per_scope_item && scopeLines.length ? scopeLines : [null];
      for (const line of targets) {
        const title = line ? String(task.title).replace("{item}", line.title) : task.title;
        taskRows.push({
          project_id: project.id,
          phase: phase.name,
          title,
          description: task.description || "",
          client_visible: task.client_visible === true,
          client_due_date: clientDue,
          internal_ready_date: internalReady,
          status: "not_started",
          priority: "medium",
          linked_line_item_id: line?.line_item_id || "",
          sort_order: order++,
        });
        if (task.deliverable) {
          deliverableRows.push({
            project_id: project.id,
            linked_line_item_id: line?.line_item_id || "",
            title: line ? `${line.title} — final files` : title,
            description: task.description || "",
            phase: phase.name,
            client_due_date: clientDue,
            internal_ready_date: internalReady,
            review_status: "not_started",
            release_rule: releaseRule,
            release_eligibility_status:
              releaseRule === "deposit_paid" ? "eligible" : "not_eligible",
          });
        }
      }
    }
  }
  if (taskRows.length) await svc.entities.ProjectTask.bulkCreate(taskRows);
  if (deliverableRows.length) await svc.entities.Deliverable.bulkCreate(deliverableRows);

  // Link milestone/final installments to the new project
  await svc.entities.PaymentInstallment.updateMany(
    { proposal_id: proposal.id },
    { $set: { project_id: project.id } }
  );

  await writeAudit(svc, {
    entity_type: "Project",
    entity_id: project.id,
    action: "project_activated",
    source: "automation",
    after_value: {
      originating_proposal_id: proposal.id,
      tasks: taskRows.length,
      deliverables: deliverableRows.length,
    },
  });
  return project;
}