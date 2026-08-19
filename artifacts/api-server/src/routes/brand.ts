import { Router, type IRouter } from "express";
import { db, personalBrandProfilesTable, corporateBrandProfilesTable, brandGuidelinesTable, brandAssetsTable, mediaKitsTable, bigPicturesTable, igniteOSTable, shareLinksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router: IRouter = Router();

// ─── Personal Brand Profiles ─────────────────────────────────────────────────
router.get("/personal-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(personalBrandProfilesTable).where(eq(personalBrandProfilesTable.user_id, String(user_id)))
    : await db.select().from(personalBrandProfilesTable);
  res.json(rows);
});

router.post("/personal-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(personalBrandProfilesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/personal-brand-profiles/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(personalBrandProfilesTable).set(data).where(eq(personalBrandProfilesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Corporate Brand Profiles ─────────────────────────────────────────────────
router.get("/corporate-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(corporateBrandProfilesTable).where(eq(corporateBrandProfilesTable.user_id, String(user_id)))
    : await db.select().from(corporateBrandProfilesTable);
  res.json(rows);
});

router.post("/corporate-brand-profiles", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(corporateBrandProfilesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/corporate-brand-profiles/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(corporateBrandProfilesTable).set(data).where(eq(corporateBrandProfilesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Brand Guidelines ─────────────────────────────────────────────────────────
router.get("/brand-guidelines", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(brandGuidelinesTable).where(eq(brandGuidelinesTable.user_id, String(user_id)))
    : await db.select().from(brandGuidelinesTable);
  res.json(rows);
});

router.post("/brand-guidelines", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(brandGuidelinesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/brand-guidelines/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(brandGuidelinesTable).set(data).where(eq(brandGuidelinesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Brand Assets ─────────────────────────────────────────────────────────────
router.get("/brand-assets", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(brandAssetsTable).where(eq(brandAssetsTable.user_id, String(user_id)))
    : await db.select().from(brandAssetsTable);
  res.json(rows);
});

router.post("/brand-assets", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(brandAssetsTable).values(req.body).returning();
  res.status(201).json(row);
});

router.delete("/brand-assets/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(brandAssetsTable).where(eq(brandAssetsTable.id, id));
  res.sendStatus(204);
});

// ─── Media Kits ───────────────────────────────────────────────────────────────
router.get("/media-kits", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(mediaKitsTable).where(eq(mediaKitsTable.user_id, String(user_id)))
    : await db.select().from(mediaKitsTable);
  res.json(rows);
});

router.post("/media-kits", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(mediaKitsTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/media-kits/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(mediaKitsTable).set(data).where(eq(mediaKitsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── Big Picture ──────────────────────────────────────────────────────────────
router.get("/big-pictures", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(bigPicturesTable).where(eq(bigPicturesTable.user_id, String(user_id)))
    : await db.select().from(bigPicturesTable);
  res.json(rows);
});

router.post("/big-pictures", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(bigPicturesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/big-pictures/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(bigPicturesTable).set(data).where(eq(bigPicturesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ─── IgniteOS ─────────────────────────────────────────────────────────────────
router.get("/ignite-os", authMiddleware, async (req, res): Promise<void> => {
  const { user_id } = req.query;
  const rows = user_id
    ? await db.select().from(igniteOSTable).where(eq(igniteOSTable.user_id, String(user_id)))
    : await db.select().from(igniteOSTable);
  res.json(rows);
});

router.post("/ignite-os", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(igniteOSTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/ignite-os/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const data = { ...req.body }; delete data.id;
  const [row] = await db.update(igniteOSTable).set(data).where(eq(igniteOSTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
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
  let profile: unknown = null;
  if (link.profile_type === "personal") {
    const [row] = await db.select().from(personalBrandProfilesTable).where(eq(personalBrandProfilesTable.id, profileId));
    profile = row || null;
  } else if (link.profile_type === "corporate") {
    const [row] = await db.select().from(corporateBrandProfilesTable).where(eq(corporateBrandProfilesTable.id, profileId));
    profile = row || null;
  } else if (link.profile_type === "media_kit") {
    const [row] = await db.select().from(mediaKitsTable).where(eq(mediaKitsTable.id, profileId));
    profile = row || null;
  }
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({ profile_type: link.profile_type, profile });
});

// ─── Share Links ──────────────────────────────────────────────────────────────
router.get("/share-links/:token", async (req, res): Promise<void> => {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const [row] = await db.select().from(shareLinksTable).where(eq(shareLinksTable.token, token));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.post("/share-links", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db.insert(shareLinksTable).values(req.body).returning();
  res.status(201).json(row);
});

export default router;
