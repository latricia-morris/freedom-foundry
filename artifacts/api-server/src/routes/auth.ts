import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createToken, hashPassword, comparePassword, authMiddleware } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, first_name, last_name } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    password_hash: hashPassword(password),
    first_name: first_name || null,
    last_name: last_name || null,
  }).returning();
  const token = createToken(user.id);
  res.status(201).json({
    user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, created_at: user.created_at },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user || !user.password_hash || !comparePassword(password, user.password_hash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = createToken(user.id);
  res.json({
    user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, created_at: user.created_at },
    token,
  });
});

router.get("/auth/me", authMiddleware, async (req, res): Promise<void> => {
  const user = (req as any).user;
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, created_at: user.created_at });
});

router.patch("/auth/me", authMiddleware, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const { first_name, last_name } = req.body;
  const [updated] = await db.update(usersTable)
    .set({ first_name, last_name })
    .where(eq(usersTable.id, user.id))
    .returning();
  res.json({ id: updated.id, email: updated.email, first_name: updated.first_name, last_name: updated.last_name, role: updated.role, created_at: updated.created_at });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

// Password reset request — always responds success to avoid email enumeration.
// Email delivery is not configured yet, so no email is actually sent.
router.post("/auth/forgot-password", (_req, res): void => {
  res.json({ success: true });
});

router.post("/auth/reset-password", (_req, res): void => {
  res.status(400).json({ error: "Password reset is not available yet. Please contact support." });
});

export default router;
