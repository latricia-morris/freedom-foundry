import { Router, type IRouter } from "express";
import { db, usersTable, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router: IRouter = Router();

// Admin: list all users
router.get("/users", authMiddleware, async (req, res): Promise<void> => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const users = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    first_name: usersTable.first_name,
    last_name: usersTable.last_name,
    role: usersTable.role,
    created_at: usersTable.created_at,
  }).from(usersTable).orderBy(usersTable.created_at);
  res.json(users);
});

// User profiles
router.get("/user-profiles", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  let rows;
  if (user_id) {
    rows = await db.select().from(userProfilesTable).where(eq(userProfilesTable.user_id, String(user_id)));
  } else {
    rows = await db.select().from(userProfilesTable);
  }
  res.json(rows);
});

router.post("/user-profiles", authMiddleware, async (req, res): Promise<void> => {
  const data = req.body;
  const [created] = await db.insert(userProfilesTable).values(data).returning();
  res.status(201).json(created);
});

router.patch("/user-profiles/:id", authMiddleware, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const data = req.body;
  // Remove undefined/null id to avoid overwrite
  delete data.id;
  const [updated] = await db.update(userProfilesTable).set(data).where(eq(userProfilesTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

export default router;
