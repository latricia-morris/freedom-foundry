import { Router, type IRouter } from "express";
import { db, vaultItemsTable, courseModulesTable, courseLessonsTable, lessonProgressTable, workbookDefinitionsTable, workbookResponsesTable, checklistTasksTable, brandUpPromptsTable, brandUpEntriesTable, serviceRequestSubmissionsTable, userProfilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  authMiddleware,
  ownedCreatePayload,
  ownedNotFound,
  ownedUpdatePayload,
  requireAdmin,
  requireMemberId,
} from "../lib/auth";

const router: IRouter = Router();

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
router.get("/service-requests", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(serviceRequestSubmissionsTable)
    .where(eq(serviceRequestSubmissionsTable.user_id, userId));
  res.json(rows);
});

router.post("/service-requests", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof serviceRequestSubmissionsTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(serviceRequestSubmissionsTable).values(data).returning();
  res.status(201).json(row);
});

// ─── File Upload (stub — returns placeholder URL) ─────────────────────────────
router.post("/upload", authMiddleware, async (req, res): Promise<void> => {
  // Basic multer-free upload stub; returns a placeholder
  res.json({ file_url: "", signed_url: null });
});

export default router;
