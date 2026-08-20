import { Router, type IRouter } from "express";
import { db, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router: IRouter = Router();

// With Clerk, registration/login/logout are handled client-side by the Clerk SDK.
// These stubs keep any legacy callers from 404-ing during the transition.

router.post("/auth/register", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

router.post("/auth/login", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.post("/auth/forgot-password", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

router.post("/auth/reset-password", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

function profileFields(profile: typeof userProfilesTable.$inferSelect | undefined) {
  return {
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    phone: profile?.phone ?? "",
    headshot_image_url: profile?.headshot_url ?? "",
  };
}

async function getMemberProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.user_id, userId))
    .limit(1);
  return profile;
}

// /api/auth/me — returns the session's safe profile and app role.
router.get("/auth/me", authMiddleware, async (req, res): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const profile = await getMemberProfile(req.userId);
  res.json({
    user: req.user
      ? {
          id: req.user.id,
          email: req.user.email,
          ...profileFields(profile),
          firstName: profile?.first_name ?? req.user.firstName,
          lastName: profile?.last_name ?? req.user.lastName,
          role: req.user.role,
        }
      : { id: req.userId },
    profile: profile ?? null,
  });
});

// /api/auth/me — update the authenticated member's private profile record.
// Ownership is always derived from the Clerk session, never from request data.
router.patch("/auth/me", authMiddleware, async (req, res): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body && typeof req.body === "object"
    ? req.body as Record<string, unknown>
    : {};
  const profileChanges = Object.fromEntries(
    Object.entries({
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      headshot_url: body.headshot_url ?? body.headshot_image_url,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(profileChanges).length === 0) {
    res.status(400).json({ error: "Choose at least one profile setting to update" });
    return;
  }
  if (Object.values(profileChanges).some((value) => value !== null && typeof value !== "string")) {
    res.status(400).json({ error: "Profile settings must be text values" });
    return;
  }

  const existingProfile = await getMemberProfile(req.userId);
  const profile = existingProfile
    ? (await db
      .update(userProfilesTable)
      .set(profileChanges)
      .where(eq(userProfilesTable.id, existingProfile.id))
      .returning())[0]
    : (await db
      .insert(userProfilesTable)
      .values({ user_id: req.userId, ...profileChanges })
      .returning())[0];

  res.json({
    user: {
      id: req.user?.id ?? req.userId,
      email: req.user?.email ?? null,
      ...profileFields(profile),
      firstName: profile?.first_name ?? req.user?.firstName ?? null,
      lastName: profile?.last_name ?? req.user?.lastName ?? null,
      role: req.user?.role ?? "user",
    },
    profile,
  });
});

export default router;
