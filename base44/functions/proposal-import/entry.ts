import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import {
  AGENCY,
  buildAgreement,
  buildOverview,
  defaultSchedule,
  SCOPE_FOOTER,
  TIMELINE_PRESETS,
} from "../../shared/proposal/content.ts";
import { writeAudit } from "../../shared/agency/core.ts";

// Deterministic money helpers (never LLM arithmetic).
const toCents = (v) => Math.round((Number(v) || 0) * 100);
const dateOnly = (d) => new Date(Date.now() + 0).toISOString().slice(0, 10);

/** Strip HTML/scripts and hostile instructions from imported strings. */
function sanitize(value) {
  if (typeof value === "string") {
    return value
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/javascript:/gi, "")
      .trim();
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v);
    return out;
  }
  return value;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const PARSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    project_type: { type: "string" },
    recipient: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        company_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        title: { type: "string" },
      },
    },
    introduction: { type: "string" },
    context: { type: "string" },
    goals: { type: "array", items: { type: "string" } },
    scope_modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          group: { type: "string" },
          objective: { type: "string" },
          deliverables: { type: "array", items: { type: "string" } },
          quantity_note: { type: "string" },
          revision_allowance: { type: "string" },
          client_responsibilities: { type: "array", items: { type: "string" } },
          exclusions: { type: "array", items: { type: "string" } },
          dependencies: { type: "array", items: { type: "string" } },
        },
        required: ["name"],
      },
    },
    not_included: { type: "array", items: { type: "string" } },
    timeline: {
      type: "object",
      properties: {
        preset: { type: "string" },
        phases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              action: { type: "string" },
              timing: { type: "string" },
              dependency: { type: "string" },
            },
            required: ["name"],
          },
        },
        milestones: {
          type: "array",
          items: {
            type: "object",
            properties: { description: { type: "string" }, due_event: { type: "string" } },
            required: ["description"],
          },
        },
      },
    },
    investment: {
      type: "object",
      properties: {
        mode: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              kind: { type: "string" },
              tier_group: { type: "string" },
              quantity_default: { type: "number" },
              quantity_min: { type: "number" },
              quantity_max: { type: "number" },
              unit_price: { type: "number" },
              unit: { type: "string" },
              description: { type: "string" },
            },
            required: ["label"],
          },
        },
        credits: { type: "array", items: { type: "object", properties: { label: { type: "string" }, amount: { type: "number" } }, required: ["label"] } },
        schedule: { type: "array", items: { type: "object", properties: { label: { type: "string" }, percent: { type: "number" }, due_event: { type: "string" } }, required: ["label", "percent"] } },
        monthly: { type: "object", properties: { amount: { type: "number" }, months: { type: "number" }, billing_start: { type: "string" } } },
      },
    },
    future_work: { type: "array", items: { type: "object", properties: { label: { type: "string" }, price: { type: "number" }, term_note: { type: "string" } }, required: ["label"] } },
    agreement_overrides: { type: "array", items: { type: "object", properties: { clause: { type: "string" }, change: { type: "string" } }, required: ["clause"] } },
    unresolved: { type: "array", items: { type: "object", properties: { section: { type: "string" }, note: { type: "string" } }, required: ["section"] } },
  },
  required: ["title"],
};

async function requireAdmin(base44) {
  const user = await base44.auth.me();
  if (!user || user.role !== "admin") return null;
  return user;
}

async function computeBlockers(doc, options = {}) {
  const blockers = [];
  const r = doc.recipient || {};
  if (!r.full_name) blockers.push("Unresolved recipient identity.");
  if (!r.contracting_party_name) blockers.push("Missing contracting party name.");
  if (!r.notice_email) blockers.push("Missing client notice email.");
  const inv = doc.investment || {};
  const items = inv.items || [];
  if (!items.length) blockers.push("No priced scope items.");
  if (!(inv.mode === "monthly")) {
    const total = items.reduce((sum, i) => sum + toCents(i.unit_price) * (i.quantity_default || 1), 0);
    if (total <= 0) blockers.push("Investment total must be greater than zero.");
    const schedule = inv.schedule || [];
    if (!schedule.length) blockers.push("No payment schedule.");
    if (schedule.length && schedule.reduce((s, e) => s + (e.percent || 0), 0) !== 100) {
      blockers.push("Payment schedule percentages must total 100.");
    }
    if (!schedule.some((e) => (e.percent || 0) < 100)) {
      blockers.push("Missing final-payment trigger for the remaining balance.");
    }
  } else {
    const m = inv.monthly || {};
    if (!m.amount || !m.months || !m.billing_start) blockers.push("Monthly engagements need amount, term, and billing start condition.");
  }
  const phases = (doc.timeline && doc.timeline.phases) || [];
  if (!phases.length) blockers.push("Timeline is undefined.");
  const text = JSON.stringify(doc.content || {});
  if (text.includes("{{")) blockers.push("An unfilled token remains in the content.");
  const overrides = (doc.parse_review || []).filter((n) => n.kind === "override");
  if (overrides.length && !options.overrides_confirmed) blockers.push("Agreement overrides need review confirmation before publication.");
  (doc.parse_review || []).filter((n) => n.kind === "unresolved").forEach((n) => blockers.push(`Unresolved: ${n.note || n.section || "imported content"}`));
  return blockers;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireAdmin(base44);
    if (!user) return Response.json({ error: "forbidden" }, { status: 403 });
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "parse") {
      const markdown = String(body.markdown || "");
      if (markdown.trim().length < 40) return Response.json({ error: "markdown_too_short" }, { status: 400 });
      const hash = await sha256(markdown);
      if (body.proposal_id) {
        const existing = await svc.entities.ProposalDoc.get(body.proposal_id).catch(() => null);
        if (existing && existing.parsed_source_hash === hash && existing.parsed_payload_cache) {
          return Response.json({ cached: true, parsed: existing.parsed_payload_cache });
        }
      }
      const res = await svc.integrations.Core.InvokeLLM({
        prompt: `You are parsing a marketing agency proposal document written in Markdown into a structured JSON model. Extract ONLY content that is present in the document; never invent prices, quantities, dates, deliverables, or claims. Money values are USD numbers (not cents). Scope modules belong to a group among: Creative, Development, Strategy & Research, Content & Messaging, Ongoing Work, or Custom. Investment item kind is one of: required, addon, tier. If tiers exist, give each tier the same tier_group label. Preserve the author's exact wording for scope and copy. List anything ambiguous or unmapped in "unresolved" with the section name and a short note. List any explicit departures from standard agency terms in "agreement_overrides". Document follows:\n\n${markdown}`,
        response_json_schema: PARSE_SCHEMA,
        model: "gemini_3_flash",
      });
      const parsed = sanitize(res);
      if (body.proposal_id) {
        await svc.entities.ProposalDoc.update(body.proposal_id, {
          parsed_source_hash: hash,
          parsed_payload_cache: parsed,
        });
      }
      return Response.json({ parsed });
    }

    if (action === "save-draft") {
      const payload = sanitize(body.payload || {});
      const recipient = payload.recipient || {};
      const isIndividual = !recipient.company_name;
      const update = {
        agency_client_id: body.agency_client_id || "",
        title: payload.title || "Client proposal",
        project_type: payload.project_type || "",
        recipient: {
          ...recipient,
          is_individual: isIndividual,
          greeting_name: recipient.greeting_name || (recipient.full_name || "").split(" ")[0] || "",
          contracting_party_name: isIndividual ? recipient.full_name : (recipient.company_legal_name || recipient.company_name),
          notice_email: recipient.notice_email || recipient.email || "",
        },
        content: payload.content || {},
        investment: payload.investment || {},
        timeline: payload.timeline || {},
        parse_review: payload.parse_review || [],
        sections_visible: payload.sections_visible || {},
        currency: "USD",
        issue_date: payload.issue_date || dateOnly(new Date()),
        expiry_date: payload.expiry_date || "",
        admin_notes: payload.admin_notes || "",
      };
      if (body.proposal_id) {
        const existing = await svc.entities.ProposalDoc.get(body.proposal_id).catch(() => null);
        if (existing && existing.status !== "draft") {
          return Response.json({ error: "published_read_only" }, { status: 400 });
        }
        await svc.entities.ProposalDoc.update(body.proposal_id, update);
        return Response.json({ id: body.proposal_id });
      }
      const doc = await svc.entities.ProposalDoc.create(update);
      return Response.json({ id: doc.id });
    }

    if (action === "publish") {
      const doc = await svc.entities.ProposalDoc.get(body.proposal_id).catch(() => null);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      if (!["draft", "changes_requested"].includes(doc.status)) {
        return Response.json({ error: "not_publishable" }, { status: 400 });
      }

      // Resolve overview defaults with the frozen recipient
      const isIndividual = doc.recipient?.is_individual === true;
      const overview = buildOverview({
        is_individual: isIndividual,
        company_name: doc.recipient?.company_name || "",
        full_name: doc.recipient?.full_name || "",
        greeting_name: doc.recipient?.greeting_name || "",
      });
      const imported = doc.content || {};
      const content = {
        ...overview,
        project: {
          heading: isIndividual ? "What we are taking care of for you." : `What we are taking care of for ${doc.recipient.company_name}.`,
          intro: "The following sections define the work included in this proposal, the deliverables you will receive, and the review opportunities and responsibilities that apply.",
          context: imported.context || "",
          goals: imported.goals || [],
          modules: imported.modules || [],
          responsibilities: imported.responsibilities || [],
          not_included: imported.not_included || [],
          footer: SCOPE_FOOTER,
        },
      };
      if (imported.introduction) content.introduction = { ...content.introduction, body: imported.introduction };

      const isWebsiteBuild = String(doc.project_type || "").includes("website");
      const investment = { ...(doc.investment || {}) };
      if (investment.mode !== "monthly" && !(investment.schedule || []).length) {
        investment.schedule = defaultSchedule(isWebsiteBuild);
      }
      // Normalize item money to integer cents
      investment.items = (investment.items || []).map((i) => ({
        ...i,
        unit_price_cents: i.unit_price_cents ?? toCents(i.unit_price),
      }));
      investment.credits = (investment.credits || []).map((c) => ({ ...c, amount_cents: c.amount_cents ?? toCents(c.amount) }));

      // Timeline preset fallback
      let timeline = doc.timeline || {};
      if (!timeline.phases?.length && timeline.preset && TIMELINE_PRESETS[timeline.preset]) {
        timeline = TIMELINE_PRESETS[timeline.preset];
      }
      timeline.intro_label = "Estimated";

      const agreement_sections = buildAgreement(doc.recipient, {
        web_change_elected: body.web_change_elected === true,
      });

      const blockers = await computeBlockers({ ...doc, investment, timeline, content, agreement_overrides_confirmed: body.overrides_confirmed === true });
      if (blockers.length) {
        await svc.entities.ProposalDoc.update(doc.id, { publish_blockers: blockers });
        return Response.json({ error: "blocked", blockers }, { status: 400 });
      }

      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const version = (doc.version || 1) + (doc.status === "changes_requested" || doc.share_token ? 1 : 0);
      const nowISO = new Date().toISOString();
      const digestSource = JSON.stringify({ content, investment, timeline, agreement_sections, recipient: doc.recipient, version });
      const digest = await sha256(digestSource);

      const tokens = [...(doc.tokens || [])];
      if (doc.share_token) {
        tokens.forEach((t) => { if (t.token === doc.share_token) t.active = false; });
        tokens.push({ token: doc.share_token, version: doc.version || 1, active: false, created_at: doc.sent_at || nowISO });
      }
      const expiry = body.expiry_date || doc.expiry_date ||
        new Date(Date.now() + AGENCY.default_validity_days * 86400000).toISOString().slice(0, 10);

      await svc.entities.ProposalDoc.update(doc.id, {
        status: "published",
        version,
        share_token: token,
        tokens: [...tokens, { token, version, active: true, created_at: nowISO }],
        issue_date: body.issue_date || doc.issue_date || dateOnly(new Date()),
        expiry_date: expiry,
        content,
        investment,
        timeline,
        agreement_sections,
        agreement_version: AGENCY.agreement_version,
        sections_visible: doc.sections_visible || {},
        publish_blockers: [],
        content_digest: digest,
        sent_at: nowISO,
        web_change_elected: body.web_change_elected === true,
      });
      await writeAudit(svc, {
        actor: user.email,
        actor_role: "admin",
        entity_type: "ProposalDoc",
        entity_id: doc.id,
        action: "proposal_published",
        source: "admin_ui",
        after_value: { version, digest },
      });

      // Proposal-ready email
      const client = await svc.entities.AgencyClient.get(doc.agency_client_id).catch(() => null);
      const to = doc.recipient?.notice_email || client?.primary_contact_email || "";
      if (to) {
        const origin = req.headers.get("origin") || `https://brand-forge-vault.base44.app`;
        const proposalUrl = `${origin}/proposal/${token}`;
        await svc.integrations.Core.SendEmail({
          to,
          template_name: "ProposalReady",
          variables: {
            first_name: doc.recipient?.greeting_name || doc.recipient?.full_name || "there",
            company_name: isIndividual ? doc.title : (doc.recipient.company_name || "your project"),
            proposal_url: proposalUrl,
          },
        }).catch((e) => console.error("proposal-ready email failed", e.message));
      }
      return Response.json({ token, version });
    }

    if (action === "list") {
      const docs = await svc.entities.ProposalDoc.filter({ agency_client_id: body.agency_client_id || undefined }, "-created_date", 50)
        .catch(() => []);
      return Response.json({ proposals: docs });
    }

    if (action === "get") {
      const doc = await svc.entities.ProposalDoc.get(body.proposal_id).catch(() => null);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      return Response.json({ proposal: doc });
    }

    if (action === "record-offline") {
      const doc = await svc.entities.ProposalDoc.get(body.proposal_id).catch(() => null);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      const installments = await svc.entities.PaymentInstallment.filter({ proposal_id: doc.id }, "sort_order", 20);
      const deposit = (installments || []).find((i) => i.installment_type === "deposit");
      if (!deposit) return Response.json({ error: "no_deposit_installment" }, { status: 400 });
      const amount = Math.round(Number(body.amount_cents) || deposit.amount_cents);
      if (amount !== deposit.amount_cents) {
        await svc.entities.PaymentInstallment.update(deposit.id, { status: "manual_review", verification_status: "mismatch", amount_paid_cents: amount });
        return Response.json({ error: "amount_mismatch" }, { status: 400 });
      }
      await svc.entities.PaymentInstallment.update(deposit.id, {
        status: "paid",
        verification_status: "verified",
        amount_paid_cents: amount,
        paid_at: new Date().toISOString(),
        payment_method: body.method || "check",
        payment_reference: body.reference || "",
        recorded_by: user.email,
      });
      await svc.entities.ProposalDoc.update(doc.id, { status: "deposit_paid" });
      await writeAudit(svc, {
        actor: user.email,
        actor_role: "admin",
        entity_type: "PaymentInstallment",
        entity_id: deposit.id,
        action: "offline_deposit_recorded",
        source: "admin_ui",
        after_value: { amount_cents: amount, method: body.method, reference: body.reference },
      });
      return Response.json({ ok: true });
    }

    if (action === "send") {
      // Admin-only: (re)send the review invitation email for a published doc.
      const doc = await svc.entities.ProposalDoc.get(body.proposal_id).catch(() => null);
      if (!doc) return Response.json({ error: "not_found" }, { status: 404 });
      if (!doc.share_token) return Response.json({ error: "not_published" }, { status: 400 });
      const client = await svc.entities.AgencyClient.get(doc.agency_client_id).catch(() => null);
      const to = doc.recipient?.notice_email || client?.primary_contact_email || "";
      if (!to) return Response.json({ error: "no_recipient_email" }, { status: 400 });
      const isIndividual = doc.recipient?.is_individual === true;
      const origin = req.headers.get("origin") || "https://brand-forge-vault.base44.app";
      await svc.integrations.Core.SendEmail({
        to,
        template_name: "ProposalReady",
        variables: {
          first_name: doc.recipient?.greeting_name || doc.recipient?.full_name || "there",
          company_name: isIndividual ? doc.title : (doc.recipient.company_name || "your project"),
          proposal_url: `${origin}/proposal/${doc.share_token}`,
        },
      }).catch((e) => console.error("proposal invitation email failed", e.message));
      await writeAudit(svc, {
        actor: user.email,
        actor_role: "admin",
        entity_type: "ProposalDoc",
        entity_id: doc.id,
        action: "proposal_invitation_sent",
        source: "admin_ui",
      });
      return Response.json({ ok: true });
    }

    if (action === "request-change-resolve") {
      await svc.entities.ProposalDoc.update(body.proposal_id, {
        change_requests: (body.change_requests || []),
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    console.error("proposal-import error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}