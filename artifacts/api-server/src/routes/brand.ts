import { Router, type IRouter } from "express";
import { randomBytes } from "node:crypto";
import { db, personalBrandProfilesTable, corporateBrandProfilesTable, brandGuidelinesTable, brandAssetsTable, mediaKitsTable, bigPicturesTable, igniteOSTable, shareLinksTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  authMiddleware,
  ownedCreatePayload,
  ownedNotFound,
  ownedUpdatePayload,
  requireMemberId,
} from "../lib/auth";

const router: IRouter = Router();

const publicProfileFields = {
  personal: [
    "first_name", "last_name", "business_name", "headshot_urls", "short_bio", "long_bio",
    "logo_urls", "feature_links", "phone", "email", "website", "social_links",
    "location_city", "location_state", "location_country", "has_books", "book_links",
    "heading_font", "subheading_font", "body_font", "accent_font", "brand_voice",
    "brand_tonality", "positioning", "brand_specs",
  ],
  corporate: [
    "company_name", "tagline", "mission_statement", "phone", "email", "website",
    "location_city", "location_state", "location_country", "has_books", "book_links",
    "heading_font", "subheading_font", "body_font", "accent_font", "colors", "logo_urls",
    "moodboard_urls", "brand_voice", "brand_tonality", "brand_personality", "positioning",
    "target_audience", "brand_specs",
  ],
  media_kit: [
    "first_name", "last_name", "business_name", "short_bio", "long_bio", "headshot_urls",
    "logo_urls", "phone", "email", "website", "social_links", "feature_links",
    "location_city", "location_state", "location_country", "has_books", "book_links",
    "podcast_links",
  ],
} as const;

const publicGuidelineFields = [
  "heading_font", "subheading_font", "body_font", "accent_font", "logo_usage_notes",
  "color_usage_notes", "typography_notes", "photography_style", "tone_notes",
  "brand_dont_list", "additional_standards",
] as const;

function pickPublicFields(row: Record<string, unknown>, fields: readonly string[]) {
  return fields.reduce<Record<string, unknown>>((result, field) => {
    if (row[field] !== null && row[field] !== undefined && row[field] !== "") {
      result[field] = row[field];
    }
    return result;
  }, {});
}

function normalizePublicAsset(asset: Record<string, unknown>) {
  return pickPublicFields(asset, ["title", "description", "file_url", "file_type"]);
}

function normalizeColors(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((color): color is Record<string, unknown> => Boolean(color) && typeof color === "object")
    .map(color => ({
      name: typeof color.name === "string" ? color.name : "",
      hex: typeof color.hex === "string" ? color.hex : "",
    }))
    .filter(color => color.name || color.hex);
}

type CorporateMember = {
  email?: unknown;
  role?: unknown;
  permissions?: unknown;
};

function corporateMemberAccess(row: typeof corporateBrandProfilesTable.$inferSelect, email: string | null) {
  if (!email || !Array.isArray(row.account_members)) return null;
  const member = (row.account_members as CorporateMember[]).find(
    (item) => typeof item?.email === "string" && item.email.toLowerCase() === email,
  );
  if (!member) return null;
  const permissions = Array.isArray(member.permissions) ? member.permissions : [];
  return {
    role: member.role === "admin" ? "admin" : "user",
    canEdit: member.role === "admin" || permissions.includes("edit_corporate"),
  };
}

async function getCorporateAccess(userId: string, email: string | null, canEdit = false) {
  const rows = await db.select().from(corporateBrandProfilesTable);
  return rows.filter((row) => {
    if (row.user_id === userId) return true;
    const access = corporateMemberAccess(row, email);
    return Boolean(access && (!canEdit || access.canEdit));
  });
}

// ─── Personal Brand Profiles ─────────────────────────────────────────────────
router.get("/personal-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(personalBrandProfilesTable)
    .where(eq(personalBrandProfilesTable.user_id, userId));
  res.json(rows);
});

router.post("/personal-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof personalBrandProfilesTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(personalBrandProfilesTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/personal-brand-profiles/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = ownedUpdatePayload<typeof personalBrandProfilesTable.$inferInsert>(req);
  const [row] = await db.update(personalBrandProfilesTable).set(data)
    .where(and(eq(personalBrandProfilesTable.id, id), eq(personalBrandProfilesTable.user_id, userId))).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

// ─── Corporate Brand Profiles ─────────────────────────────────────────────────
router.get("/corporate-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await getCorporateAccess(userId, req.user?.email || null);
  res.json(rows);
});

router.post("/corporate-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof corporateBrandProfilesTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(corporateBrandProfilesTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/corporate-brand-profiles/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = ownedUpdatePayload<typeof corporateBrandProfilesTable.$inferInsert>(req);
  const [accessible] = (await getCorporateAccess(userId, req.user?.email || null, true))
    .filter((profile) => profile.id === id);
  if (!accessible) { ownedNotFound(res); return; }
  const [row] = await db.update(corporateBrandProfilesTable).set(data)
    .where(eq(corporateBrandProfilesTable.id, id)).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

// ─── Brand Guidelines ─────────────────────────────────────────────────────────
router.get("/brand-guidelines", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(brandGuidelinesTable)
    .where(eq(brandGuidelinesTable.user_id, userId));
  res.json(rows);
});

router.post("/brand-guidelines", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof brandGuidelinesTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(brandGuidelinesTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/brand-guidelines/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = ownedUpdatePayload<typeof brandGuidelinesTable.$inferInsert>(req);
  const [row] = await db.update(brandGuidelinesTable).set(data)
    .where(and(eq(brandGuidelinesTable.id, id), eq(brandGuidelinesTable.user_id, userId))).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

// ─── Brand Assets ─────────────────────────────────────────────────────────────
router.get("/brand-assets", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(brandAssetsTable)
    .where(eq(brandAssetsTable.user_id, userId));
  res.json(rows);
});

router.post("/brand-assets", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof brandAssetsTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(brandAssetsTable).values(data).returning();
  res.status(201).json(row);
});

router.delete("/brand-assets/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [deleted] = await db.delete(brandAssetsTable)
    .where(and(eq(brandAssetsTable.id, id), eq(brandAssetsTable.user_id, userId))).returning();
  if (!deleted) { ownedNotFound(res); return; }
  res.sendStatus(204);
});

// ─── Media Kits ───────────────────────────────────────────────────────────────
router.get("/media-kits", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(mediaKitsTable)
    .where(eq(mediaKitsTable.user_id, userId));
  res.json(rows);
});

router.post("/media-kits", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof mediaKitsTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(mediaKitsTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/media-kits/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = ownedUpdatePayload<typeof mediaKitsTable.$inferInsert>(req);
  const [row] = await db.update(mediaKitsTable).set(data)
    .where(and(eq(mediaKitsTable.id, id), eq(mediaKitsTable.user_id, userId))).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

// ─── Big Picture ──────────────────────────────────────────────────────────────
router.get("/big-pictures", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(bigPicturesTable)
    .where(eq(bigPicturesTable.user_id, userId));
  res.json(rows);
});

router.post("/big-pictures", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof bigPicturesTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(bigPicturesTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/big-pictures/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = ownedUpdatePayload<typeof bigPicturesTable.$inferInsert>(req);
  const [row] = await db.update(bigPicturesTable).set(data)
    .where(and(eq(bigPicturesTable.id, id), eq(bigPicturesTable.user_id, userId))).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

// ─── IgniteOS ─────────────────────────────────────────────────────────────────
router.get("/ignite-os", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(igniteOSTable)
    .where(eq(igniteOSTable.user_id, userId));
  res.json(rows);
});

router.post("/ignite-os", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof igniteOSTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.insert(igniteOSTable).values(data).returning();
  res.status(201).json(row);
});

router.patch("/ignite-os/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = ownedUpdatePayload<typeof igniteOSTable.$inferInsert>(req);
  const [row] = await db.update(igniteOSTable).set(data)
    .where(and(eq(igniteOSTable.id, id), eq(igniteOSTable.user_id, userId))).returning();
  if (!row) { ownedNotFound(res); return; }
  res.json(row);
});

// ─── Shared Profile (public, replaces the get-shared-profile function) ───────
router.get("/shared-profile/:token", async (req, res): Promise<void> => {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const [link] = await db.select().from(shareLinksTable).where(eq(shareLinksTable.token, token));
  if (!link || !link.is_active) {
    res.status(404).json({ error: "Invalid or expired link" });
    return;
  }
  const profileId = link.profile_id ? parseInt(link.profile_id, 10) : NaN;
  if (Number.isNaN(profileId)) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  let profileRow: Record<string, unknown> | null = null;
  if (link.profile_type === "personal") {
    const [row] = await db.select().from(personalBrandProfilesTable).where(eq(personalBrandProfilesTable.id, profileId));
    profileRow = row ? (row as Record<string, unknown>) : null;
  } else if (link.profile_type === "corporate") {
    const [row] = await db.select().from(corporateBrandProfilesTable).where(eq(corporateBrandProfilesTable.id, profileId));
    profileRow = row ? (row as Record<string, unknown>) : null;
  } else if (link.profile_type === "media_kit") {
    const [row] = await db.select().from(mediaKitsTable).where(eq(mediaKitsTable.id, profileId));
    profileRow = row ? (row as Record<string, unknown>) : null;
  }
  if (!profileRow) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const userId = profileRow.user_id;
  const [guidelineRows, assetRows, corporateRows, personalRows, mediaKitRows] = await Promise.all([
    db.select().from(brandGuidelinesTable).where(eq(brandGuidelinesTable.user_id, String(userId))),
    db.select().from(brandAssetsTable).where(eq(brandAssetsTable.user_id, String(userId))),
    db.select().from(corporateBrandProfilesTable).where(eq(corporateBrandProfilesTable.user_id, String(userId))),
    db.select().from(personalBrandProfilesTable).where(eq(personalBrandProfilesTable.user_id, String(userId))),
    db.select().from(mediaKitsTable).where(eq(mediaKitsTable.user_id, String(userId))),
  ]);

  const guidelines = guidelineRows[0] ? pickPublicFields(
    guidelineRows[0] as Record<string, unknown>,
    publicGuidelineFields,
  ) : null;
  const corporate = corporateRows[0] as Record<string, unknown> | undefined;
  const profileFields = publicProfileFields[link.profile_type as keyof typeof publicProfileFields]
    || publicProfileFields.personal;

  const fontSource = corporate || (personalRows[0] as Record<string, unknown> | undefined)
    || (mediaKitRows[0] as Record<string, unknown> | undefined) || profileRow;
  const fonts = pickPublicFields(fontSource, [
    "heading_font", "subheading_font", "body_font", "accent_font",
  ]);

  res.json({
    version: 1,
    profile_type: link.profile_type,
    profile: pickPublicFields(profileRow, profileFields),
    guidelines,
    assets: assetRows.map(asset => normalizePublicAsset(asset as Record<string, unknown>)),
    brand: {
      colors: normalizeColors(corporate?.colors),
      fonts,
      voice: corporate?.brand_voice || profileRow.brand_voice || null,
      tonality: corporate?.brand_tonality || profileRow.brand_tonality || null,
      positioning: corporate?.positioning || profileRow.positioning || null,
      target_audience: corporate?.target_audience || null,
      mission_statement: corporate?.mission_statement || null,
      tagline: corporate?.tagline || null,
    },
  });
});

router.post("/share-links", authMiddleware, async (req, res): Promise<void> => {
  const { profile_type, profile_id, is_active = true } = req.body;
  const profileId = Number(profile_id);
  if (!["personal", "corporate", "media_kit"].includes(profile_type) || !Number.isInteger(profileId) || profileId <= 0) {
    res.status(400).json({ error: "A supported profile type and profile are required" });
    return;
  }
  if (!req.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let profileOwnerId: string | null = null;
  if (profile_type === "personal") {
    const [profile] = await db.select({ user_id: personalBrandProfilesTable.user_id })
      .from(personalBrandProfilesTable)
      .where(eq(personalBrandProfilesTable.id, profileId));
    profileOwnerId = profile?.user_id ?? null;
  } else if (profile_type === "corporate") {
    const [profile] = await db.select({ user_id: corporateBrandProfilesTable.user_id })
      .from(corporateBrandProfilesTable)
      .where(eq(corporateBrandProfilesTable.id, profileId));
    profileOwnerId = profile?.user_id ?? null;
  } else {
    const [profile] = await db.select({ user_id: mediaKitsTable.user_id })
      .from(mediaKitsTable)
      .where(eq(mediaKitsTable.id, profileId));
    profileOwnerId = profile?.user_id ?? null;
  }

  // Do not distinguish an absent profile from one owned by another member.
  if (profileOwnerId !== req.userId) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const [row] = await db.insert(shareLinksTable).values({
    token: randomBytes(24).toString("base64url"),
    profile_type,
    profile_id: String(profileId),
    is_active: Boolean(is_active),
  }).returning();
  res.status(201).json(row);
});

export default router;
