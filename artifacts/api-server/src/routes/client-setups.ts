import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import {
  bigPicturesTable,
  brandAssetsTable,
  brandGuidelinesTable,
  checklistTasksTable,
  clientSetupsTable,
  clientSetupTemplatesTable,
  corporateBrandProfilesTable,
  db,
  mediaKitsTable,
  personalBrandProfilesTable,
  serviceRequestSubmissionsTable,
  userProfilesTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { authMiddleware, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

const STATUSES = new Set(["draft", "ready_to_invite", "invited", "claimed"]);
const editableSections = {
  personal: [
    "first_name", "last_name", "business_name", "headshot_urls", "short_bio", "long_bio",
    "logo_urls", "feature_links", "phone", "email", "website", "social_links",
    "heading_font", "subheading_font", "body_font", "accent_font", "brand_voice",
    "brand_tonality", "brand_prompts", "brand_specs", "positioning",
  ],
  corporate: [
    "company_name", "tagline", "mission_statement", "phone", "email", "website",
    "heading_font", "subheading_font", "body_font", "accent_font", "colors", "logo_urls",
    "moodboard_urls", "brand_voice", "brand_tonality", "brand_personality", "brand_prompts",
    "brand_specs", "positioning", "target_audience", "account_members",
  ],
  guidelines: [
    "heading_font", "subheading_font", "body_font", "accent_font", "logo_usage_notes",
    "color_usage_notes", "typography_notes", "photography_style", "tone_notes",
    "brand_dont_list", "additional_standards",
  ],
  mediaKit: [
    "first_name", "last_name", "business_name", "short_bio", "long_bio", "headshot_urls",
    "logo_urls", "phone", "email", "website", "social_links", "feature_links",
    "has_books", "book_links", "podcast_links",
  ],
  bigPicture: [
    "word_for_the_year", "end_of_year_goal", "secondary_goal", "annual_revenue",
    "monthly_revenue", "weekly_revenue", "client_booking_target", "clients_per_week",
    "impact_statement", "legacy_statement", "long_term_goal_3yr", "long_term_goal_5yr",
    "long_term_revenue", "long_term_positioning",
  ],
} as const;

type SetupPayload = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  const email = text(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function pickSection(value: unknown, fields: readonly string[]) {
  const source = isRecord(value) ? value : {};
  return fields.reduce<Record<string, unknown>>((result, field) => {
    const item = source[field];
    if (typeof item === "string" && item.trim()) result[field] = item.trim();
    if (typeof item === "boolean") result[field] = item;
    if (Array.isArray(item) || isRecord(item)) result[field] = item;
    return result;
  }, {});
}

function normalizeAssets(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.reduce<Record<string, string>[]>((items, item) => {
    if (!isRecord(item) || !text(item.title)) return items;
    items.push({
      title: text(item.title),
      ...(text(item.description) ? { description: text(item.description) } : {}),
      ...(text(item.file_url) ? { file_url: text(item.file_url) } : {}),
      ...(text(item.file_type) ? { file_type: text(item.file_type) } : {}),
    });
    return items;
  }, []);
}

function normalizeChecklist(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.reduce<Record<string, string>[]>((items, item) => {
    if (!isRecord(item) || !text(item.title)) return items;
    items.push({
      title: text(item.title),
      ...(text(item.deadline_date) ? { deadline_date: text(item.deadline_date) } : {}),
      ...(text(item.assignee) ? { assignee: text(item.assignee) } : {}),
    });
    return items;
  }, []);
}

function normalizeServices(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.reduce<Record<string, string>[]>((items, item) => {
    if (!isRecord(item) || !text(item.service_type)) return items;
    items.push({
      service_type: text(item.service_type),
      ...(text(item.details) ? { details: text(item.details) } : {}),
    });
    return items;
  }, []);
}

function normalizeAccountMembers(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.reduce<Record<string, unknown>[]>((members, item) => {
    if (!isRecord(item)) return members;
    const email = normalizeEmail(item.email);
    const role = item.role === "admin" ? "admin" : "user";
    if (!email) return members;
    if (members.some((member) => member.email === email)) return members;
    members.push({
      email,
      role,
      permissions: role === "admin"
        ? ["view_corporate", "edit_corporate", "manage_users"]
        : ["view_corporate"],
    });
    return members;
  }, []);
}

function normalizePayload(value: unknown): SetupPayload {
  const source = isRecord(value) ? value : {};
  const corporate = pickSection(source.corporate, editableSections.corporate);
  const sourceCorporate = isRecord(source.corporate) ? source.corporate : {};
  if (Array.isArray(sourceCorporate.account_members)) {
    corporate.account_members = normalizeAccountMembers(sourceCorporate.account_members);
  }
  return {
    personal: pickSection(source.personal, editableSections.personal),
    corporate,
    guidelines: pickSection(source.guidelines, editableSections.guidelines),
    mediaKit: pickSection(source.mediaKit, editableSections.mediaKit),
    bigPicture: pickSection(source.bigPicture, editableSections.bigPicture),
    assets: normalizeAssets(source.assets),
    checklist: normalizeChecklist(source.checklist),
    serviceRequests: normalizeServices(source.serviceRequests),
  };
}

function normalizeTemplatePayload(value: unknown): SetupPayload {
  const payload = normalizePayload(value);
  // Templates are reusable agency content, not client identity or strategy.
  return {
    guidelines: payload.guidelines,
    assets: payload.assets,
    checklist: payload.checklist,
    serviceRequests: payload.serviceRequests,
  };
}

function dedupeObjects(items: unknown[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergePayload(template: SetupPayload, existing: SetupPayload): SetupPayload {
  return {
    ...template,
    ...existing,
    guidelines: { ...(isRecord(template.guidelines) ? template.guidelines : {}), ...(isRecord(existing.guidelines) ? existing.guidelines : {}) },
    assets: dedupeObjects([...(Array.isArray(template.assets) ? template.assets : []), ...(Array.isArray(existing.assets) ? existing.assets : [])]),
    checklist: dedupeObjects([...(Array.isArray(template.checklist) ? template.checklist : []), ...(Array.isArray(existing.checklist) ? existing.checklist : [])]),
    serviceRequests: dedupeObjects([...(Array.isArray(template.serviceRequests) ? template.serviceRequests : []), ...(Array.isArray(existing.serviceRequests) ? existing.serviceRequests : [])]),
  };
}

function completeness(payload: SetupPayload) {
  const sectionCount = ["personal", "corporate", "guidelines", "mediaKit", "bigPicture"]
    .filter((key) => isRecord(payload[key]) && Object.keys(payload[key]).length > 0).length;
  const assetCount = Array.isArray(payload.assets) ? payload.assets.length : 0;
  const checklistCount = Array.isArray(payload.checklist) ? payload.checklist.length : 0;
  const serviceCount = Array.isArray(payload.serviceRequests) ? payload.serviceRequests.length : 0;
  return {
    completed_sections: sectionCount,
    total_sections: 5,
    assets: assetCount,
    checklist_items: checklistCount,
    service_requests: serviceCount,
    is_ready: sectionCount > 0 && assetCount > 0,
  };
}

function serializeSetup(row: typeof clientSetupsTable.$inferSelect) {
  const payload = normalizePayload(row.payload);
  return {
    ...row,
    payload,
    summary: completeness(payload),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

function serializeTemplate(row: typeof clientSetupTemplatesTable.$inferSelect) {
  return {
    ...row,
    payload: normalizeTemplatePayload(row.payload),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

async function getSetup(id: number) {
  const [setup] = await db.select().from(clientSetupsTable).where(eq(clientSetupsTable.id, id)).limit(1);
  return setup;
}

function parseId(value: string | string[] | undefined) {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function upsertSingleton(tx: any, table: any, userId: string, values: Record<string, unknown>) {
  if (Object.keys(values).length === 0) return;
  const [existing] = await tx.select().from(table).where(eq(table.user_id, userId)).limit(1);
  if (existing) await tx.update(table).set(values).where(eq(table.id, existing.id));
  else await tx.insert(table).values({ user_id: userId, ...values });
}

async function promotePayload(tx: any, setup: typeof clientSetupsTable.$inferSelect, userId: string) {
  const payload = normalizePayload(setup.payload);
  await upsertSingleton(tx, userProfilesTable, userId, {
    ...(text(setup.first_name) ? { first_name: text(setup.first_name) } : {}),
    ...(text(setup.last_name) ? { last_name: text(setup.last_name) } : {}),
    ...(text(setup.business_name) ? { business_name: text(setup.business_name) } : {}),
  });
  await upsertSingleton(tx, personalBrandProfilesTable, userId, payload.personal as Record<string, unknown>);
  await upsertSingleton(tx, corporateBrandProfilesTable, userId, payload.corporate as Record<string, unknown>);
  await upsertSingleton(tx, brandGuidelinesTable, userId, payload.guidelines as Record<string, unknown>);
  await upsertSingleton(tx, mediaKitsTable, userId, payload.mediaKit as Record<string, unknown>);
  await upsertSingleton(tx, bigPicturesTable, userId, payload.bigPicture as Record<string, unknown>);

  const assets = normalizeAssets(payload.assets);
  for (const asset of assets) {
    const existing = await tx.select().from(brandAssetsTable)
      .where(and(eq(brandAssetsTable.user_id, userId), eq(brandAssetsTable.title, asset.title))).limit(1);
    if (existing.length === 0) await tx.insert(brandAssetsTable).values({ user_id: userId, ...asset });
  }

  const tasks = normalizeChecklist(payload.checklist);
  for (const task of tasks) {
    const existing = await tx.select().from(checklistTasksTable)
      .where(and(eq(checklistTasksTable.user_id, userId), eq(checklistTasksTable.title, task.title))).limit(1);
    if (existing.length === 0) await tx.insert(checklistTasksTable).values({
      user_id: userId,
      title: task.title,
      ...task,
    });
  }

  const services = normalizeServices(payload.serviceRequests);
  for (const service of services) {
    const existing = await tx.select().from(serviceRequestSubmissionsTable)
      .where(and(eq(serviceRequestSubmissionsTable.user_id, userId), eq(serviceRequestSubmissionsTable.service_type, service.service_type))).limit(1);
    if (existing.length === 0) {
      await tx.insert(serviceRequestSubmissionsTable).values({
        user_id: userId,
        service_type: service.service_type,
        ...(service.details ? { details: { admin_note: service.details } } : {}),
      });
    }
  }

  await tx.update(clientSetupsTable).set({ status: "claimed", claimed_user_id: userId }).where(eq(clientSetupsTable.id, setup.id));
}

router.get("/admin/client-setups", authMiddleware, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(clientSetupsTable).orderBy(clientSetupsTable.updated_at);
  res.json(rows.map(serializeSetup));
});

router.post("/admin/client-setups", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const body = isRecord(req.body) ? req.body : {};
  const email = normalizeEmail(body.email);
  if (!email) { res.status(400).json({ error: "Enter a valid client email address." }); return; }

  const [existing] = await db.select().from(clientSetupsTable).where(eq(clientSetupsTable.email, email)).limit(1);
  if (existing) { res.status(409).json({ error: "A client setup already exists for that email address." }); return; }

  const [setup] = await db.insert(clientSetupsTable).values({
    email,
    ...(text(body.first_name) ? { first_name: text(body.first_name) } : {}),
    ...(text(body.last_name) ? { last_name: text(body.last_name) } : {}),
    ...(text(body.business_name) ? { business_name: text(body.business_name) } : {}),
    ...(text(body.notes) ? { notes: text(body.notes) } : {}),
    payload: normalizePayload(body.payload),
  }).returning();
  res.status(201).json(serializeSetup(setup));
});

router.get("/admin/client-setups/:id", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const setup = id ? await getSetup(id) : undefined;
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  res.json(serializeSetup(setup));
});

router.patch("/admin/client-setups/:id", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const setup = id ? await getSetup(id) : undefined;
  const body = isRecord(req.body) ? req.body : {};
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  if (setup.status === "claimed") { res.status(409).json({ error: "This portal has already been activated. Edit it from the member account instead." }); return; }
  const status = typeof body.status === "string" && STATUSES.has(body.status) && body.status !== "claimed"
    ? body.status
    : setup.status;
  const [updated] = await db.update(clientSetupsTable).set({
    ...(body.email !== undefined ? { email: normalizeEmail(body.email) || setup.email } : {}),
    ...(body.first_name !== undefined ? { first_name: text(body.first_name) || null } : {}),
    ...(body.last_name !== undefined ? { last_name: text(body.last_name) || null } : {}),
    ...(body.business_name !== undefined ? { business_name: text(body.business_name) || null } : {}),
    ...(body.notes !== undefined ? { notes: text(body.notes) || null } : {}),
    ...(body.payload !== undefined ? { payload: normalizePayload(body.payload) } : {}),
    status,
  }).where(eq(clientSetupsTable.id, setup.id)).returning();
  res.json(serializeSetup(updated));
});

router.post("/admin/client-setups/:id/import", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const setup = id ? await getSetup(id) : undefined;
  const body = isRecord(req.body) ? req.body : {};
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  if (setup.status === "claimed") { res.status(409).json({ error: "This portal has already been activated. Edit it from the member account instead." }); return; }
  if (!isRecord(body.payload)) { res.status(400).json({ error: "Paste a valid setup object before importing." }); return; }
  const [updated] = await db.update(clientSetupsTable).set({ payload: normalizePayload(body.payload) })
    .where(eq(clientSetupsTable.id, setup.id)).returning();
  res.json(serializeSetup(updated));
});

router.get("/admin/client-setup-templates", authMiddleware, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(clientSetupTemplatesTable).orderBy(clientSetupTemplatesTable.name);
  res.json(rows.map(serializeTemplate));
});

router.post("/admin/client-setup-templates", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const body = isRecord(req.body) ? req.body : {};
  const name = text(body.name);
  if (!name) { res.status(400).json({ error: "Give this agency template a name." }); return; }
  const [existing] = await db.select().from(clientSetupTemplatesTable).where(eq(clientSetupTemplatesTable.name, name)).limit(1);
  if (existing) { res.status(409).json({ error: "An agency template with that name already exists." }); return; }
  const [template] = await db.insert(clientSetupTemplatesTable).values({
    name,
    ...(text(body.description) ? { description: text(body.description) } : {}),
    payload: normalizeTemplatePayload(body.payload),
  }).returning();
  res.status(201).json(serializeTemplate(template));
});

router.post("/admin/client-setups/:id/apply-template", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const setup = id ? await getSetup(id) : undefined;
  const templateId = Number(isRecord(req.body) ? req.body.template_id : 0);
  const [template] = Number.isInteger(templateId) && templateId > 0
    ? await db.select().from(clientSetupTemplatesTable).where(eq(clientSetupTemplatesTable.id, templateId)).limit(1)
    : [];
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  if (setup.status === "claimed") { res.status(409).json({ error: "This portal has already been activated. Edit it from the member account instead." }); return; }
  if (!template) { res.status(404).json({ error: "Agency template not found." }); return; }
  const [updated] = await db.update(clientSetupsTable).set({
    payload: mergePayload(normalizeTemplatePayload(template.payload), normalizePayload(setup.payload)),
  }).where(eq(clientSetupsTable.id, setup.id)).returning();
  res.json(serializeSetup(updated));
});

router.post("/admin/client-setups/:id/invite", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const setup = id ? await getSetup(id) : undefined;
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  if (!completeness(normalizePayload(setup.payload)).is_ready) {
    res.status(400).json({ error: "Add at least one brand section and one asset before inviting this client." });
    return;
  }
  if (setup.status === "claimed") { res.status(409).json({ error: "This client portal is already active." }); return; }
  try {
    await clerkClient.invitations.createInvitation({ emailAddress: setup.email });
    const normalized = normalizePayload(setup.payload);
    const corporate = isRecord(normalized.corporate) ? normalized.corporate : {};
    const members = Array.isArray(corporate.account_members)
      ? corporate.account_members as Record<string, unknown>[]
      : [];
    const secondaryInvites = [];
    for (const member of members) {
      const email = normalizeEmail(member.email);
      if (!email || email === setup.email) continue;
      try {
        await clerkClient.invitations.createInvitation({ emailAddress: email });
        secondaryInvites.push(email);
      } catch {
        // An existing account can join by signing in; only the primary setup
        // invitation determines whether this operation is considered failed.
      }
    }
    const [updated] = await db.update(clientSetupsTable).set({ status: "invited" }).where(eq(clientSetupsTable.id, setup.id)).returning();
    res.json({ ...serializeSetup(updated), invited_member_emails: secondaryInvites });
  } catch {
    res.status(409).json({ error: "An invitation or account already exists for this email. Use Activate when the client account is available." });
  }
});

router.post("/admin/client-setups/:id/claim", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const setup = id ? await getSetup(id) : undefined;
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  if (setup.status === "claimed") { res.json(serializeSetup(setup)); return; }
  if (!completeness(normalizePayload(setup.payload)).is_ready) {
    res.status(400).json({ error: "Add at least one brand section and one asset before activating this portal." });
    return;
  }
  const users = await clerkClient.users.getUserList({ emailAddress: [setup.email], limit: 1 });
  const user = users.data[0];
  const userEmail = normalizeEmail(user?.primaryEmailAddress?.emailAddress);
  if (!user || userEmail !== setup.email) {
    res.status(409).json({ error: "The matching client account has not accepted an invitation yet." });
    return;
  }

  const claimResult = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(clientSetupsTable)
      .where(eq(clientSetupsTable.id, setup.id))
      .for("update")
      .limit(1);
    if (!current) return "missing";
    if (current.status === "claimed") return "claimed";
    if (!completeness(normalizePayload(current.payload)).is_ready) return "not_ready";
    await promotePayload(tx, current, user.id);
    return "promoted";
  });

  if (claimResult === "missing") { res.status(404).json({ error: "Client setup not found." }); return; }
  if (claimResult === "not_ready") {
    res.status(400).json({ error: "Add at least one brand section and one asset before activating this portal." });
    return;
  }
  const claimed = await getSetup(setup.id);
  res.json(serializeSetup(claimed!));
});

router.patch("/admin/client-setups/:id/members", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const setup = id ? await getSetup(id) : undefined;
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  if (setup.status !== "claimed" || !setup.claimed_user_id) {
    res.status(409).json({ error: "Activate the client portal before changing its account access." });
    return;
  }

  const members = normalizeAccountMembers(req.body?.members);
  const [profile] = await db.update(corporateBrandProfilesTable)
    .set({ account_members: members })
    .where(eq(corporateBrandProfilesTable.user_id, setup.claimed_user_id))
    .returning();
  if (!profile) { res.status(404).json({ error: "Corporate brand profile not found." }); return; }

  const invitedMemberEmails: string[] = [];
  for (const member of members) {
    const email = normalizeEmail(member.email);
    if (!email || email === setup.email) continue;
    try {
      await clerkClient.invitations.createInvitation({ emailAddress: email });
      invitedMemberEmails.push(email);
    } catch {
      // Existing accounts do not need a second invitation to use access.
    }
  }
  res.json({ members, invited_member_emails: invitedMemberEmails });
});

export const clientSetupTestables = {
  normalizePayload,
  normalizeTemplatePayload,
  mergePayload,
  completeness,
};

export default router;