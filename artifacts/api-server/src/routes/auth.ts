import { Router, type IRouter } from "express";
import { db, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router: IRouter = Router();

const captchaPurposes = new Set(["sign-up", "password-recovery"]);
const CAPTCHA_VERIFY_TIMEOUT_MS = 8000;
type CaptchaVerificationResponse = {
  success?: boolean;
  score?: number;
  action?: string;
};

// Google reCAPTCHA verification stays on the server so the secret never reaches the browser.
router.post("/auth/captcha/verify", async (req, res): Promise<void> => {
  const body = req.body && typeof req.body === "object"
    ? req.body as Record<string, unknown>
    : {};
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const purpose = typeof body.purpose === "string" ? body.purpose : "";

  if (!token || token.length > 4096 || !captchaPurposes.has(purpose)) {
    res.status(400).json({ error: "Complete the human verification and try again", code: "CAPTCHA_REQUIRED" });
    return;
  }

  const secret = process.env.GOOGLE_reCAPTCHA?.trim();
  if (!secret) {
    req.log?.error({ purpose }, "reCAPTCHA server secret is not configured");
    res.status(503).json({ error: "Human verification is temporarily unavailable", code: "CAPTCHA_UNAVAILABLE" });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CAPTCHA_VERIFY_TIMEOUT_MS);
    try {
      const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
        signal: controller.signal,
      });

      if (!verification.ok) {
        req.log?.error({ status: verification.status, purpose }, "reCAPTCHA verification service failed");
        res.status(502).json({ error: "Human verification is temporarily unavailable", code: "CAPTCHA_UNAVAILABLE" });
        return;
      }

      const result = await verification.json() as CaptchaVerificationResponse;
      const scoreIsAcceptable = result.score === undefined || result.score >= 0.5;
      const expectedAction = purpose === "sign-up" ? "sign_up" : "password_recovery";
      const actionIsAcceptable = result.action === undefined || result.action === expectedAction;
      if (!result.success || !scoreIsAcceptable || !actionIsAcceptable) {
        res.status(400).json({ error: "Complete the human verification and try again", code: "CAPTCHA_FAILED" });
        return;
      }

      res.json({ verified: true });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    req.log?.error({ err: error, purpose }, "reCAPTCHA verification request failed");
    res.status(502).json({ error: "Human verification is temporarily unavailable", code: "CAPTCHA_UNAVAILABLE" });
  }
});

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
          referral_only: req.user.referralOnly ?? false,
          referral_access: Boolean(req.user.referralPartnerId),
          referral_partner: {
            has_access: Boolean(req.user.referralPartnerId) && req.user.referralPartnerStatus === "active",
            partner_id: req.user.referralPartnerId ?? null,
            status: req.user.referralPartnerStatus ?? null,
            referral_only: req.user.referralOnly ?? false,
          },
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
      referral_only: req.user?.referralOnly ?? false,
      referral_access: Boolean(req.user?.referralPartnerId),
      referral_partner: {
        has_access: Boolean(req.user?.referralPartnerId),
        partner_id: req.user?.referralPartnerId ?? null,
        status: req.user?.referralPartnerStatus ?? null,
        referral_only: req.user?.referralOnly ?? false,
      },
    },
    profile,
  });
});

export default router;
