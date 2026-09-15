import { Router, type IRouter } from "express";
import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import { db, personaQuizAttemptsTable, questions, scoreQuizAnswers } from "@workspace/db";
import { authMiddleware, optionalAuth, requireAdmin, requireMemberId } from "../lib/auth";
import { clerkClient } from "@clerk/express";

const router: IRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const expirationMs = 1000 * 60 * 60 * 24 * 7;

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function parseAnswers(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length !== questions.length ||
      value.some((answer) => !Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= 6)) return null;
  return value as number[];
}

function result(row: typeof personaQuizAttemptsTable.$inferSelect) {
  return {
    id: row.id, primaryArchetype: row.primary_archetype, primaryScore: row.primary_score,
    secondaryArchetype: row.secondary_archetype, secondaryScore: row.secondary_score,
    createdAt: row.created_at,
  };
}

function adminResult(row: typeof personaQuizAttemptsTable.$inferSelect) {
  return {
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    marketing_consent: row.marketing_consent,
    primary_archetype: row.primary_archetype,
    primary_score: row.primary_score,
    secondary_archetype: row.secondary_archetype,
    secondary_score: row.secondary_score,
    status: row.status,
    expires_at: row.expires_at,
    claimed_at: row.claimed_at,
    created_at: row.created_at,
  };
}

async function verifiedPrimaryEmail(userId: string): Promise<string | null> {
  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.primaryEmailAddress;
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") return null;
  return primaryEmail.emailAddress.trim().toLowerCase();
}

router.get("/persona-quiz/definition", (_req, res) => {
  // The definition is intentionally read-only and contains no lead or attempt data.
  // Scoring weights stay server-side so changing the browser cannot influence results.
  res.json({
    questions: questions.map(({ id, text, answers }) => ({
      id, text, answers: answers.map(({ text: answerText }) => ({ text: answerText })),
    })),
  });
});

router.post("/persona-quiz/complete", optionalAuth, async (req, res): Promise<void> => {
  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const answers = parseAnswers(body.answers);
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  let email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const userId = req.userId ?? null;
  // optionalAuth intentionally does not trust any browser identity. Resolve the
  // Clerk user server-side when a session is present.
  if (userId) {
    const verifiedEmail = await verifiedPrimaryEmail(userId);
    if (!verifiedEmail) {
      res.status(400).json({ error: "The authenticated account requires a verified email" }); return;
    }
    if (email && verifiedEmail !== email) {
      res.status(403).json({ error: "Email must match the authenticated account" }); return;
    }
    email = verifiedEmail;
  }
  if (!answers || firstName.length < 1 || firstName.length > 100 || !emailPattern.test(email) || email.length > 320) {
    res.status(400).json({ error: "Exactly 18 valid answers, a first name, and a valid email are required" }); return;
  }
  if (body.marketingConsent !== true) {
    res.status(400).json({ error: "Marketing consent is required to receive the Brand Persona report and selected insights." });
    return;
  }
  const scored = scoreQuizAnswers(answers);
  const [row] = await db.insert(personaQuizAttemptsTable).values({
    first_name: firstName, email, marketing_consent: body.marketingConsent === true,
    answers, scores: scored.scores, primary_archetype: scored.primary, primary_score: scored.primaryScore,
    secondary_archetype: scored.secondary, secondary_score: scored.secondaryScore,
    token_hash: tokenHash(token), status: userId ? "claimed" : "pending", user_id: userId,
    expires_at: new Date(now.getTime() + expirationMs), claimed_at: userId ? now : null,
  }).returning();
  if (userId) {
    res.status(201).json({ result: result(row) });
    return;
  }
  res.status(201).json({ token, expiresAt: row.expires_at });
});

router.post("/persona-quiz/claim", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const token = typeof req.body?.token === "string" ? req.body.token : "";
  if (!token) { res.status(400).json({ error: "A valid claim token is required" }); return; }
  const verifiedEmail = await verifiedPrimaryEmail(userId);
  if (!verifiedEmail) { res.status(400).json({ error: "The authenticated account requires a verified email" }); return; }
  const [row] = await db.select().from(personaQuizAttemptsTable)
    .where(and(eq(personaQuizAttemptsTable.token_hash, tokenHash(token)), eq(personaQuizAttemptsTable.status, "pending"),
      gt(personaQuizAttemptsTable.expires_at, new Date()))).limit(1);
  if (!row) { res.status(404).json({ error: "Attempt not found or already claimed" }); return; }
  if (row.email !== verifiedEmail) { res.status(403).json({ error: "Attempt email does not match authenticated account" }); return; }
  const [claimed] = await db.update(personaQuizAttemptsTable).set({
    status: "claimed", user_id: userId, claimed_at: new Date(),
  }).where(and(eq(personaQuizAttemptsTable.id, row.id), eq(personaQuizAttemptsTable.status, "pending"))).returning();
  if (!claimed) { res.status(409).json({ error: "Attempt has already been claimed" }); return; }
  res.json({ result: result(claimed) });
});

router.get("/persona-quiz/history", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res); if (!userId) return;
  const rows = await db.select().from(personaQuizAttemptsTable)
    .where(eq(personaQuizAttemptsTable.user_id, userId)).orderBy(desc(personaQuizAttemptsTable.created_at));
  res.json(rows.map(result));
});
router.get("/persona-quiz/latest", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res); if (!userId) return;
  const [row] = await db.select().from(personaQuizAttemptsTable).where(eq(personaQuizAttemptsTable.user_id, userId))
    .orderBy(desc(personaQuizAttemptsTable.created_at)).limit(1);
  res.json(row ? result(row) : null);
});

router.get("/admin/persona-quiz/attempts", authMiddleware, requireAdmin, async (_req, res) => {
  const rows = await db.select().from(personaQuizAttemptsTable).orderBy(desc(personaQuizAttemptsTable.created_at));
  res.json(rows.map(adminResult));
});
router.get("/admin/persona-quiz/leads", authMiddleware, requireAdmin, async (_req, res) => {
  const rows = await db.select().from(personaQuizAttemptsTable).orderBy(desc(personaQuizAttemptsTable.created_at));
  res.json(rows.map(adminResult));
});

export default router;