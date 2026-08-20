import { Router, type IRouter } from "express";
import { db, vaultItemsTable, courseModulesTable, courseLessonsTable, lessonProgressTable, workbookDefinitionsTable, workbookResponsesTable, checklistTasksTable, brandUpPromptsTable, brandUpEntriesTable, serviceRequestSubmissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

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
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(lessonProgressTable).where(eq(lessonProgressTable.user_id, String(user_id)))
    : await db.select().from(lessonProgressTable);
  res.json(rows);
});

router.post("/lesson-progress", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(lessonProgressTable).values(req.body).returning();
  res.status(201).json(row);
});

router.delete("/lesson-progress/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(lessonProgressTable).where(eq(lessonProgressTable.id, id));
  res.sendStatus(204);
});

// ─── Workbook Definitions ─────────────────────────────────────────────────────
router.get("/workbook-definitions", async (req, res): Promise<void> => {
  const { status, vault_item_id } = req.query;
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

router.get("/workbook-definitions/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [row] = await db.select().from(workbookDefinitionsTable).where(eq(workbookDefinitionsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Workbook Responses ───────────────────────────────────────────────────────
router.get("/workbook-responses", authMiddleware, async (req, res): Promise<void> => {
  const { user_id, workbook_id } = req.query;
  let rows;
  if (user_id && workbook_id) {
    rows = await db.select().from(workbookResponsesTable)
      .where(and(eq(workbookResponsesTable.user_id, String(user_id)), eq(workbookResponsesTable.workbook_id, Number(workbook_id))));
  } else if (user_id) {
    rows = await db.select().from(workbookResponsesTable).where(eq(workbookResponsesTable.user_id, String(user_id)));
  } else {
    rows = await db.select().from(workbookResponsesTable);
  }
  res.json(rows);
});

router.post("/workbook-responses", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(workbookResponsesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/workbook-responses/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(workbookResponsesTable).set(data).where(eq(workbookResponsesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Checklist Tasks ──────────────────────────────────────────────────────────
router.get("/checklist-tasks", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(checklistTasksTable).where(eq(checklistTasksTable.user_id, String(user_id)))
    : await db.select().from(checklistTasksTable);
  res.json(rows);
});

router.post("/checklist-tasks", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(checklistTasksTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/checklist-tasks/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(checklistTasksTable).set(data).where(eq(checklistTasksTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/checklist-tasks/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(checklistTasksTable).where(eq(checklistTasksTable.id, id));
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
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(brandUpEntriesTable).where(eq(brandUpEntriesTable.user_id, String(user_id)))
    : await db.select().from(brandUpEntriesTable);
  res.json(rows);
});

router.post("/brand-up-entries", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(brandUpEntriesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.delete("/brand-up-entries/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(brandUpEntriesTable).where(eq(brandUpEntriesTable.id, id));
  res.sendStatus(204);
});

// ─── Service Requests ─────────────────────────────────────────────────────────
router.get("/service-requests", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(serviceRequestSubmissionsTable).where(eq(serviceRequestSubmissionsTable.user_id, String(user_id)))
    : await db.select().from(serviceRequestSubmissionsTable);
  res.json(rows);
});

router.post("/service-requests", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(serviceRequestSubmissionsTable).values(req.body).returning();
  res.status(201).json(row);
});

// ─── File Upload (stub — returns placeholder URL) ─────────────────────────────
router.post("/upload", authMiddleware, async (req, res): Promise<void> => {
  // Basic multer-free upload stub; returns a placeholder
  res.json({ file_url: "", signed_url: null });
});

export default router;
