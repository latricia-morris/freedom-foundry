import { Router, type IRouter } from "express";
import { db, vaultItemsTable, courseModulesTable, courseLessonsTable, lessonProgressTable, workbookDefinitionsTable, workbookResponsesTable, checklistTasksTable, brandUpPromptsTable, brandUpEntriesTable, serviceRequestSubmissionsTable, userProfilesTable, serviceHubConfigTable, clientSetupsTable, bigPicturesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  authMiddleware,
  ownedCreatePayload,
  ownedNotFound,
  ownedUpdatePayload,
  requireAdmin,
  requireMemberId,
} from "../lib/auth";

const router: IRouter = Router();

const DEFAULT_NOTIFICATION_RECIPIENT = "latricia@thebrandrevivalist.com";
const DEFAULT_SERVICE_CATEGORIES = [
  {
    key: "strategy-branding",
    title: "Brand Strategy & Branding",
    description: "Clarify the brand, sharpen the position, and build an identity people remember.",
    examples: ["Brand strategy and positioning", "Messaging and voice", "Logo and identity systems"],
    cta: "Start a Brand Conversation",
    route: "conversation",
    visible: true,
    status: "active",
    pricing_text: null,
  },
  {
    key: "website-digital",
    title: "Website & Digital Experience",
    description: "Create a digital experience that makes the right next step obvious.",
    examples: ["Website strategy and design", "UX/UI and information architecture", "Copy and SEO foundations"],
    cta: "Plan a Digital Experience",
    route: "conversation",
    visible: true,
    status: "active",
    pricing_text: null,
  },
  {
    key: "design-activation",
    title: "Design & Activation",
    description: "Turn the strategy into focused creative assets for the moments that matter.",
    examples: ["Launch and campaign assets", "Print, packaging, and event materials", "Social and digital creative"],
    cta: "Plan a Creative Project",
    route: "conversation",
    visible: true,
    status: "active",
    pricing_text: null,
  },
  {
    key: "brand-guidance",
    title: "Brand Guidance",
    description: "Get practical direction when you need a clear decision, review, or next move.",
    examples: ["Brand reviews and audits", "Messaging and offer guidance", "Ongoing strategic counsel"],
    cta: "Ask for Brand Guidance",
    route: "guidance",
    visible: true,
    status: "active",
    pricing_text: null,
  },
  {
    key: "saas-automation",
    title: "SaaS, CRM & Automation",
    description: "Make the systems behind the brand easier to use, connect, and grow.",
    examples: ["CRM and lead capture", "Workflow and automation planning", "SaaS tool recommendations"],
    cta: "Map My Systems",
    route: "conversation",
    visible: true,
    status: "active",
    pricing_text: null,
  },
  {
    key: "trusted-support",
    title: "Trusted Support",
    description: "A thoughtful handoff to a trusted specialist when the right answer lives outside our core work.",
    examples: ["Technical support referrals", "Specialist introductions", "Partner-led implementation"],
    cta: "Find Trusted Support",
    route: "support",
    visible: true,
    status: "active",
    pricing_text: null,
  },
];

const DEFAULT_NOTIFICATION_TEMPLATES = {
  internal_subject: "New Freedom Foundry service request",
  internal_intro: "A member submitted a new service request.",
  confirmation_subject: "We received your Freedom Foundry request",
  confirmation_intro: "Thanks for reaching out. We received your request and will be in touch soon.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function textValue(value: unknown, maxLength = 1000): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function jsonRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function serviceHubConfigResponse(row?: typeof serviceHubConfigTable.$inferSelect) {
  return {
    id: row?.id ?? null,
    categories: Array.isArray(row?.categories) && row.categories.length > 0 ? row.categories : DEFAULT_SERVICE_CATEGORIES,
    notification_recipient: row?.notification_recipient || DEFAULT_NOTIFICATION_RECIPIENT,
    notification_templates: isRecord(row?.notification_templates) && Object.keys(row.notification_templates).length > 0
      ? row.notification_templates
      : DEFAULT_NOTIFICATION_TEMPLATES,
    update_threshold_months: row?.update_threshold_months || 12,
    updated_at: row?.updated_at?.toISOString() ?? null,
  };
}

async function getServiceHubConfig() {
  const [row] = await db.select().from(serviceHubConfigTable).where(eq(serviceHubConfigTable.id, 1)).limit(1);
  return row;
}

type ServiceEmail = {
  to: string;
  subject: string;
  text: string;
  requestId: number;
};

async function deliverServiceEmail(message: ServiceEmail, log: { error?: Function; warn?: Function }): Promise<{ status: string; error?: string }> {
  const endpoint = process.env.SERVICE_REQUEST_EMAIL_WEBHOOK_URL?.trim();
  if (!endpoint) {
    const error = "SERVICE_REQUEST_EMAIL_WEBHOOK_URL is not configured";
    log.error?.({ requestId: message.requestId, to: message.to }, error);
    return { status: "failed", error };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: message.to,
        subject: message.subject,
        text: message.text,
        request_id: message.requestId,
      }),
    });
    if (!response.ok) {
      const error = `Email webhook returned ${response.status}`;
      log.error?.({ requestId: message.requestId, to: message.to, status: response.status }, error);
      return { status: "failed", error };
    }
    return { status: "sent" };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Email webhook request failed";
    log.error?.({ requestId: message.requestId, to: message.to, err: error }, messageText);
    return { status: "failed", error: messageText };
  }
}

async function sendServiceRequestEmails(
  request: typeof serviceRequestSubmissionsTable.$inferSelect,
  submitterEmail: string | null | undefined,
  log: { error?: Function; warn?: Function },
): Promise<void> {
  const config = serviceHubConfigResponse(await getServiceHubConfig());
  const templates = { ...DEFAULT_NOTIFICATION_TEMPLATES, ...jsonRecord(config.notification_templates) };
  const details = jsonRecord(request.details);
  const answers = jsonRecord(details.answers);
  const summary = [
    `Request #${request.id}`,
    `Category: ${request.service_type}`,
    `Request type: ${request.request_kind}`,
    `Client status: ${request.client_status}`,
    request.objective ? `Objective: ${request.objective}` : null,
    request.timeline ? `Timeline: ${request.timeline}` : null,
    `Answers: ${JSON.stringify(answers)}`,
  ].filter(Boolean).join("\n");
  const internal = await deliverServiceEmail({
    to: config.notification_recipient,
    subject: String(templates.internal_subject),
    text: `${String(templates.internal_intro)}\n\n${summary}`,
    requestId: request.id,
  }, log);
  const confirmation = submitterEmail
    ? await deliverServiceEmail({
      to: submitterEmail,
      subject: String(templates.confirmation_subject),
      text: `${String(templates.confirmation_intro)}\n\nYour request: ${request.service_type}\nReference: #${request.id}`,
      requestId: request.id,
    }, log)
    : { status: "failed", error: "No member email is available for confirmation" };

  await db.update(serviceRequestSubmissionsTable).set({
    notification_status: internal.status,
    confirmation_status: confirmation.status,
    email_error: [internal.error, confirmation.error].filter(Boolean).join("; ") || null,
  }).where(eq(serviceRequestSubmissionsTable.id, request.id));
}

async function requireBrandPowerMovesAccess(req: Parameters<typeof authMiddleware>[0], res: Parameters<typeof authMiddleware>[1]): Promise<boolean> {
  const userId = requireMemberId(req, res);
  if (!userId) return false;
  const [profile] = await db
    .select({ unlocked: userProfilesTable.brand_power_moves_unlocked })
    .from(userProfilesTable)
    .where(eq(userProfilesTable.user_id, userId))
    .limit(1);

  if (!profile?.unlocked) {
    res.status(403).json({ error: "Brand Power Moves access is locked" });
    return false;
  }
  return true;
}

async function isAboveTheNoiseWorkbook(workbookId: number): Promise<boolean> {
  const [definition] = await db
    .select({ vault_item_id: workbookDefinitionsTable.vault_item_id })
    .from(workbookDefinitionsTable)
    .where(eq(workbookDefinitionsTable.id, workbookId))
    .limit(1);
  if (!definition?.vault_item_id) return false;
  const [item] = await db
    .select({ title: vaultItemsTable.title })
    .from(vaultItemsTable)
    .where(eq(vaultItemsTable.id, definition.vault_item_id))
    .limit(1);
  return item?.title === "Above the Noise: 31 High-Impact Brand Differentiation Strategies";
}

async function requireWorkbookAccess(
  req: Parameters<typeof authMiddleware>[0],
  res: Parameters<typeof authMiddleware>[1],
  workbookId?: number,
): Promise<boolean> {
  if (workbookId && await isAboveTheNoiseWorkbook(workbookId)) {
    return Boolean(requireMemberId(req, res));
  }
  return requireBrandPowerMovesAccess(req, res);
}

// ─── Vault Items ──────────────────────────────────────────────────────────────
router.get("/vault-items", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vaultItemsTable).orderBy(vaultItemsTable.order);
  res.json(rows);
});

router.get("/vault-items/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [row] = await db.select().from(vaultItemsTable).where(eq(vaultItemsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Course Modules ───────────────────────────────────────────────────────────
router.get("/course-modules", async (req, res): Promise<void> => {
  const { vault_item_id } = req.query;
  if (vault_item_id) {
    const rows = await db.select().from(courseModulesTable)
      .where(and(eq(courseModulesTable.vault_item_id, Number(vault_item_id)), eq(courseModulesTable.status, "published")))
      .orderBy(courseModulesTable.order);
    res.json(rows);
  } else {
    const rows = await db.select().from(courseModulesTable).orderBy(courseModulesTable.order);
    res.json(rows);
  }
});

// ─── Course Lessons ───────────────────────────────────────────────────────────
router.get("/course-lessons", async (req, res): Promise<void> => {
  const { module_id } = req.query;
  if (module_id) {
    const rows = await db.select().from(courseLessonsTable)
      .where(and(eq(courseLessonsTable.module_id, Number(module_id)), eq(courseLessonsTable.status, "published")))
      .orderBy(courseLessonsTable.order);
    res.json(rows);
  } else {
    const rows = await db.select().from(courseLessonsTable).orderBy(courseLessonsTable.order);
    res.json(rows);
  }
});

// ─── Lesson Progress ──────────────────────────────────────────────────────────
router.get("/lesson-progress", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(lessonProgressTable)
    .where(eq(lessonProgressTable.user_id, userId));
  res.json(rows);
});

router.post("/lesson-progress", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof lessonProgressTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(lessonProgressTable).values(data).returning();
  res.status(201).json(row);
});

router.delete("/lesson-progress/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [deleted] = await db.delete(lessonProgressTable)
    .where(and(eq(lessonProgressTable.id, id), eq(lessonProgressTable.user_id, userId))).returning();
  if (!deleted) { ownedNotFound(res); return; }
  res.sendStatus(204);
});

// ─── Workbook Definitions ─────────────────────────────────────────────────────
router.get("/workbook-definitions", authMiddleware, async (req, res): Promise<void> => {
  const { status, vault_item_id } = req.query;
  const targetVaultItemId = vault_item_id ? Number(vault_item_id) : undefined;
  if (targetVaultItemId) {
    const [item] = await db.select({ title: vaultItemsTable.title })
      .from(vaultItemsTable)
      .where(eq(vaultItemsTable.id, targetVaultItemId))
      .limit(1);
    if (item?.title === "Above the Noise: 31 High-Impact Brand Differentiation Strategies") {
      if (!requireMemberId(req, res)) return;
      const rows = await db.select().from(workbookDefinitionsTable)
        .where(eq(workbookDefinitionsTable.vault_item_id, targetVaultItemId))
        .orderBy(workbookDefinitionsTable.order);
      res.json(rows);
      return;
    }
  }
  if (!await requireBrandPowerMovesAccess(req, res)) return;
  let rows;
  if (vault_item_id) {
    rows = await db.select().from(workbookDefinitionsTable)
      .where(eq(workbookDefinitionsTable.vault_item_id, Number(vault_item_id)))
      .orderBy(workbookDefinitionsTable.order);
  } else if (status) {
    rows = await db.select().from(workbookDefinitionsTable)
      .where(eq(workbookDefinitionsTable.status, String(status)))
      .orderBy(workbookDefinitionsTable.order);
  } else {
    rows = await db.select().from(workbookDefinitionsTable).orderBy(workbookDefinitionsTable.order);
  }
  res.json(rows);
});

router.get("/workbook-definitions/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (!await requireWorkbookAccess(req, res, id)) return;
  const [row] = await db.select().from(workbookDefinitionsTable).where(eq(workbookDefinitionsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Workbook Responses ───────────────────────────────────────────────────────
router.get("/workbook-responses", authMiddleware, async (req, res): Promise<void> => {
  const requestedWorkbookId = req.query.workbook_id ? Number(req.query.workbook_id) : undefined;
  if (!await requireWorkbookAccess(req, res, requestedWorkbookId)) return;
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const workbookId = req.query.workbook_id;
  const rows = workbookId
    ? await db.select().from(workbookResponsesTable)
      .where(and(eq(workbookResponsesTable.user_id, userId), eq(workbookResponsesTable.workbook_id, Number(workbookId))))
    : await db.select().from(workbookResponsesTable).where(eq(workbookResponsesTable.user_id, userId));
  res.json(rows);
});

router.post("/workbook-responses", authMiddleware, async (req, res): Promise<void> => {
  const workbookId = Number(req.body?.workbook_id);
  if (!Number.isInteger(workbookId) || !await requireWorkbookAccess(req, res, workbookId)) return;
  const data = ownedCreatePayload<typeof workbookResponsesTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(workbookResponsesTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/workbook-responses/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [existingResponse] = await db.select({ workbook_id: workbookResponsesTable.workbook_id })
    .from(workbookResponsesTable)
    .where(and(eq(workbookResponsesTable.id, id), eq(workbookResponsesTable.user_id, userId)))
    .limit(1);
  if (!existingResponse) { ownedNotFound(res); return; }
  if (!await requireWorkbookAccess(req, res, existingResponse.workbook_id)) return;
  const data = { responses: req.body?.responses };
  const [row] = await db.update(workbookResponsesTable).set(data)
    .where(and(eq(workbookResponsesTable.id, id), eq(workbookResponsesTable.user_id, userId))).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

// ─── Checklist Tasks ──────────────────────────────────────────────────────────
router.get("/checklist-tasks", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(checklistTasksTable)
    .where(eq(checklistTasksTable.user_id, userId));
  res.json(rows);
});

router.post("/checklist-tasks", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof checklistTasksTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(checklistTasksTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/checklist-tasks/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = ownedUpdatePayload<typeof checklistTasksTable.$inferInsert>(req);
  const [row] = await db.update(checklistTasksTable).set(data)
    .where(and(eq(checklistTasksTable.id, id), eq(checklistTasksTable.user_id, userId))).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

router.delete("/checklist-tasks/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [deleted] = await db.delete(checklistTasksTable)
    .where(and(eq(checklistTasksTable.id, id), eq(checklistTasksTable.user_id, userId))).returning();
  if (!deleted) { ownedNotFound(res); return; }
  res.sendStatus(204);
});

// ─── Brand Up Prompts ─────────────────────────────────────────────────────────
router.get("/brand-up-prompts", async (req, res): Promise<void> => {
  const { is_active } = req.query;
  const rows = is_active === "true"
    ? await db.select().from(brandUpPromptsTable).where(eq(brandUpPromptsTable.is_active, true)).orderBy(brandUpPromptsTable.order)
    : await db.select().from(brandUpPromptsTable).orderBy(brandUpPromptsTable.order);
  res.json(rows);
});

router.post("/brand-up-prompts", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const [row] = await db.insert(brandUpPromptsTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/brand-up-prompts/:id", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(brandUpPromptsTable).set(data).where(eq(brandUpPromptsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/brand-up-prompts/:id", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(brandUpPromptsTable).where(eq(brandUpPromptsTable.id, id));
  res.sendStatus(204);
});

// ─── Brand Up Entries ─────────────────────────────────────────────────────────
router.get("/brand-up-entries", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(brandUpEntriesTable)
    .where(eq(brandUpEntriesTable.user_id, userId));
  res.json(rows);
});

router.post("/brand-up-entries", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof brandUpEntriesTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(brandUpEntriesTable).values(data).returning();
  res.status(201).json(row);
});

router.delete("/brand-up-entries/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [deleted] = await db.delete(brandUpEntriesTable)
    .where(and(eq(brandUpEntriesTable.id, id), eq(brandUpEntriesTable.user_id, userId))).returning();
  if (!deleted) { ownedNotFound(res); return; }
  res.sendStatus(204);
});

// ─── Service Requests ─────────────────────────────────────────────────────────
router.get("/service-hub/config", authMiddleware, async (_req, res): Promise<void> => {
  res.json(serviceHubConfigResponse(await getServiceHubConfig()));
});

router.get("/service-requests/context", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const [latestRequest, latestBigPicture, latestSetup] = await Promise.all([
    db.select().from(serviceRequestSubmissionsTable)
      .where(eq(serviceRequestSubmissionsTable.user_id, userId))
      .orderBy(desc(serviceRequestSubmissionsTable.created_at))
      .limit(1),
    db.select({ updated_at: bigPicturesTable.updated_at }).from(bigPicturesTable)
      .where(eq(bigPicturesTable.user_id, userId))
      .orderBy(desc(bigPicturesTable.updated_at))
      .limit(1),
    db.select({ updated_at: clientSetupsTable.updated_at }).from(clientSetupsTable)
      .where(eq(clientSetupsTable.claimed_user_id, userId))
      .orderBy(desc(clientSetupsTable.updated_at))
      .limit(1),
  ]);
  const dates = [
    latestRequest[0]?.updated_at,
    latestBigPicture[0]?.updated_at,
    latestSetup[0]?.updated_at,
  ].filter((date): date is Date => Boolean(date));
  const latestContextAt = dates.length > 0
    ? new Date(Math.max(...dates.map(date => date.getTime())))
    : null;
  const config = serviceHubConfigResponse(await getServiceHubConfig());
  const thresholdMonths = Math.max(1, Number(config.update_threshold_months) || 12);
  const thresholdDate = new Date();
  thresholdDate.setMonth(thresholdDate.getMonth() - thresholdMonths);
  res.json({
    isReturningClient: dates.length > 0,
    latestContextAt: latestContextAt?.toISOString() ?? null,
    contextSource: [
      latestRequest[0] ? "service_request" : null,
      latestBigPicture[0] ? "brand_portal" : null,
      latestSetup[0] ? "client_setup" : null,
    ].filter(Boolean),
    isContextStale: latestContextAt ? latestContextAt < thresholdDate : false,
    thresholdMonths,
    latestRequest: latestRequest[0] ?? null,
  });
});

router.get("/service-requests", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(serviceRequestSubmissionsTable)
    .where(eq(serviceRequestSubmissionsTable.user_id, userId))
    .orderBy(desc(serviceRequestSubmissionsTable.created_at));
  res.json(rows);
});

router.post("/service-requests", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const body = isRecord(req.body) ? req.body : {};
  const serviceType = textValue(body.service_type, 200) || textValue(body.category_title, 200);
  if (!serviceType) {
    res.status(400).json({ error: "Choose a service category before submitting." });
    return;
  }
  const requestKind = textValue(body.request_kind, 40) || "category";
  const status = body.status === "draft" || body.save_for_later === true ? "draft" : "submitted";
  const detailInput = jsonRecord(body.details);
  const details = {
    ...detailInput,
    answers: jsonRecord(body.answers ?? detailInput.answers),
    selected_services: Array.isArray(body.selected_services) ? body.selected_services.slice(0, 20) : detailInput.selected_services,
    project_context: jsonRecord(body.project_context ?? detailInput.project_context),
    source: textValue(body.source, 60) || detailInput.source || "services_hub",
  };
  const [row] = await db.insert(serviceRequestSubmissionsTable).values({
    user_id: userId,
    service_type: serviceType,
    request_kind: requestKind,
    ...(textValue(body.category_key, 100) ? { category_key: textValue(body.category_key, 100) } : {}),
    client_status: textValue(body.client_status, 40) || "new",
    ...(textValue(body.objective, 2000) ? { objective: textValue(body.objective, 2000) } : {}),
    ...(textValue(body.recommendation, 500) ? { recommendation: textValue(body.recommendation, 500) } : {}),
    details,
    ...(textValue(body.budget_range, 100) ? { budget_range: textValue(body.budget_range, 100) } : {}),
    ...(textValue(body.timeline, 100) ? { timeline: textValue(body.timeline, 100) } : {}),
    deposit_acknowledged: body.deposit_acknowledged === true,
    status,
  }).returning();
  if (status === "submitted") {
    await sendServiceRequestEmails(row, req.user?.email, req.log || {});
  }
  res.status(201).json(row);
});

router.get("/admin/service-hub/config", authMiddleware, requireAdmin, async (_req, res): Promise<void> => {
  res.json(serviceHubConfigResponse(await getServiceHubConfig()));
});

router.patch("/admin/service-hub/config", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const body = isRecord(req.body) ? req.body : {};
  const categories = Array.isArray(body.categories) ? body.categories.slice(0, 20) : undefined;
  const recipient = textValue(body.notification_recipient, 320);
  const threshold = Number(body.update_threshold_months);
  const templates = isRecord(body.notification_templates) ? body.notification_templates : undefined;
  const existing = await getServiceHubConfig();
  const values = {
    ...(categories ? { categories } : {}),
    ...(recipient ? { notification_recipient: recipient } : {}),
    ...(templates ? { notification_templates: templates } : {}),
    ...(Number.isInteger(threshold) && threshold >= 1 && threshold <= 120 ? { update_threshold_months: threshold } : {}),
  };
  const [row] = existing
    ? await db.update(serviceHubConfigTable).set(values).where(eq(serviceHubConfigTable.id, existing.id)).returning()
    : await db.insert(serviceHubConfigTable).values({ id: 1, ...values }).returning();
  res.json(serviceHubConfigResponse(row));
});

router.get("/admin/service-requests", authMiddleware, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(serviceRequestSubmissionsTable)
    .orderBy(desc(serviceRequestSubmissionsTable.created_at));
  res.json(rows);
});

router.patch("/admin/service-requests/:id", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "Invalid request id" }); return; }
  const body = isRecord(req.body) ? req.body : {};
  const status = textValue(body.status, 40);
  const internalNotes = typeof body.internal_notes === "string" ? body.internal_notes.slice(0, 5000) : undefined;
  const [row] = await db.update(serviceRequestSubmissionsTable).set({
    ...(status ? { status } : {}),
    ...(internalNotes !== undefined ? { internal_notes: internalNotes } : {}),
  }).where(eq(serviceRequestSubmissionsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Request not found" }); return; }
  res.json(row);
});

// ─── File Upload (stub — returns placeholder URL) ─────────────────────────────
router.post("/upload", authMiddleware, async (req, res): Promise<void> => {
  // Basic multer-free upload stub; returns a placeholder
  res.json({ file_url: "", signed_url: null });
});

export default router;
