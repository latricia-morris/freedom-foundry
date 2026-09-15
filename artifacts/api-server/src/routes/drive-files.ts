import { Router, type IRouter, type Response as ExpressResponse } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import {
  corporateBrandProfilesTable,
  deliveryAuditLogTable,
  deliveryPaymentEligibilityTable,
  driveFileCommentsTable,
  driveFileDecisionsTable,
  driveFileVisibilityTable,
  clientSetupsTable,
  db,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { authMiddleware, requireAdmin, requireMemberId } from "../lib/auth";
import { generateDrivePreview, MAX_PREVIEW_INPUT_BYTES } from "../lib/drive-preview";

const router: IRouter = Router();
const FOLDER_MIME = "application/vnd.google-apps.folder";
const MAX_TRANSFER_BYTES = 50 * 1024 * 1024;
const VISIBLE_STATES = new Set(["review", "released"]);
const VISIBILITY_STATES = new Set(["hidden", "review", "released"]);

type CorporateMember = { email?: unknown; permissions?: unknown; role?: unknown };
type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  trashed?: boolean;
};
type Visibility = typeof driveFileVisibilityTable.$inferSelect;

function connector() {
  return new ReplitConnectors();
}

function isCorporateAdmin(row: typeof corporateBrandProfilesTable.$inferSelect, userId: string, email: string | null) {
  if (row.user_id === userId) return true;
  if (!email || !Array.isArray(row.account_members)) return false;
  return (row.account_members as CorporateMember[]).some(
    (item) => typeof item?.email === "string" && item.email.trim().toLowerCase() === email && item.role === "admin",
  );
}

function corporateMemberCanView(row: typeof corporateBrandProfilesTable.$inferSelect, email: string | null) {
  if (!email || !Array.isArray(row.account_members)) return false;
  const member = (row.account_members as CorporateMember[]).find(
    (item) => typeof item?.email === "string" && item.email.trim().toLowerCase() === email,
  );
  if (!member) return false;
  const permissions = Array.isArray(member.permissions) ? member.permissions : [];
  return member.role === "admin" || permissions.includes("view_corporate");
}

async function accessibleProfile(userId: string, email: string | null, profileId?: number) {
  const rows = profileId
    ? await db.select().from(corporateBrandProfilesTable).where(eq(corporateBrandProfilesTable.id, profileId)).limit(1)
    : await db.select().from(corporateBrandProfilesTable);
  return rows.find((row) => row.user_id === userId || corporateMemberCanView(row, email));
}

async function adminProfile(profileId: number) {
  const [profile] = await db.select().from(corporateBrandProfilesTable)
    .where(eq(corporateBrandProfilesTable.id, profileId)).limit(1);
  return profile;
}

function parsePositiveId(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseFolderId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const urlMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const id = urlMatch?.[1] || (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) ? trimmed : "");
  return id || null;
}

function driveParam(value: unknown) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{3,}$/.test(value) ? value : null;
}

function version(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 100
    ? value.trim()
    : null;
}

function previewPage(value: unknown) {
  if (value === undefined) return 1;
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 25 ? parsed : null;
}

function expectedGeneration(value: unknown) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function nonBlank(value: unknown, max = 10_000) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;
}

function escapeDriveQuery(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

async function driveJson<T = Record<string, unknown>>(path: string): Promise<T> {
  const response = await connector().proxy("google-drive", path, { method: "GET" });
  if (!response.ok) {
    const error = new Error(response.status === 404
      ? "The Google Drive item is missing or no longer accessible."
      : "Google Drive access is unavailable. Reconnect the integration or check the folder permissions.");
    Object.assign(error, { status: response.status, upstream: true });
    throw error;
  }
  return response.json() as Promise<T>;
}

async function readLimitedBody(response: Response, limit = MAX_TRANSFER_BYTES) {
  const declaredSize = Number(response.headers.get("content-length") || 0);
  if (Number.isFinite(declaredSize) && declaredSize > limit) {
    await response.body?.cancel();
    throw Object.assign(new Error("This file is larger than the 50 MB portal transfer limit."), { status: 413 });
  }
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw Object.assign(new Error("This file is larger than the 50 MB portal transfer limit."), { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}

function routeErrorStatus(error: unknown) {
  if ((error as { upstream?: unknown }).upstream) {
    return Number((error as { status?: number }).status) === 404 ? 404 : 502;
  }
  const status = Number((error as { status?: number }).status);
  return [400, 403, 404, 409, 413, 415, 422].includes(status) ? status : 502;
}

async function fileMetadata(fileId: string): Promise<DriveFile> {
  const fields = "id,name,mimeType,size,modifiedTime,parents,trashed";
  const file = await driveJson<DriveFile>(`/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true&fields=${encodeURIComponent(fields)}`);
  if (file.trashed) throw Object.assign(new Error("The Google Drive item has been deleted."), { status: 404 });
  return file;
}

async function isDescendant(fileId: string, rootId: string) {
  if (fileId === rootId) return true;
  const seen = new Set<string>();
  let frontier = [fileId];
  for (let depth = 0; depth < 50 && frontier.length; depth += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      let item: DriveFile;
      try {
        item = await fileMetadata(id);
      } catch (error) {
        // A parent outside the agency's Drive grant is not proof of
        // containment. Treat it as inaccessible rather than leaking it.
        if (Number((error as { status?: number }).status) === 404) return false;
        throw error;
      }
      for (const parent of item.parents || []) {
        if (parent === rootId) return true;
        if (!seen.has(parent)) next.push(parent);
      }
    }
    frontier = next;
  }
  return false;
}

async function breadcrumbs(folderId: string, rootId: string) {
  const items: Array<{ id: string; name: string }> = [];
  let current = folderId;
  const seen = new Set<string>();
  while (!seen.has(current) && items.length < 50) {
    seen.add(current);
    const file = await fileMetadata(current);
    items.unshift({ id: file.id, name: file.name });
    if (current === rootId) return items;
    const parent = file.parents?.[0];
    if (!parent) break;
    current = parent;
  }
  throw Object.assign(new Error("That folder is outside the assigned client folder."), { status: 404 });
}

async function folderChildren(folderId: string) {
  const query = `'${escapeDriveQuery(folderId)}' in parents and trashed = false`;
  const fields = "nextPageToken,incompleteSearch,files(id,name,mimeType,size,modifiedTime,parents,trashed)";
  return driveJson<{ files?: DriveFile[]; incompleteSearch?: boolean; nextPageToken?: string }>(
    `/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=1000&orderBy=folder,name&supportsAllDrives=true&includeItemsFromAllDrives=true`,
  );
}

async function visibilityFor(profileId: number, fileId: string) {
  const [row] = await db.select().from(driveFileVisibilityTable)
    .where(and(eq(driveFileVisibilityTable.corporate_profile_id, profileId), eq(driveFileVisibilityTable.drive_file_id, fileId)))
    .limit(1);
  return row;
}

function hasCurrentVisibleVersion(row: Visibility | undefined, file: DriveFile) {
  return Boolean(row && VISIBLE_STATES.has(row.visibility) && file.modifiedTime && row.drive_modified_time === file.modifiedTime);
}

async function folderHasVisibleDescendant(profileId: number, folderId: string, seen = new Set<string>(), depth = 0): Promise<boolean> {
  if (depth >= 50 || seen.has(folderId)) return false;
  seen.add(folderId);
  const results = await folderChildren(folderId);
  for (const child of results.files || []) {
    if (child.mimeType === FOLDER_MIME) {
      if (await folderHasVisibleDescendant(profileId, child.id, seen, depth + 1)) return true;
      continue;
    }
    if (hasCurrentVisibleVersion(await visibilityFor(profileId, child.id), child)) return true;
  }
  return false;
}

function safeFilename(name: string) {
  const cleaned = name.replace(/[\u0000-\u001f\u007f"\\/:*?<>|]+/g, "_").trim();
  return (cleaned || "download").slice(0, 180);
}

function preventClientCaching(res: ExpressResponse) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
}

function toClientItem(file: DriveFile, visibility: Visibility) {
  return {
    id: file.id,
    name: file.name,
    mime_type: file.mimeType,
    is_folder: false,
    size: file.size ? Number(file.size) : null,
    modified_time: file.modifiedTime || null,
    visibility: visibility.visibility,
  };
}

async function assertCurrentFile(profileId: number, rootId: string, fileId: string, expectedVersion?: string) {
  const file = await fileMetadata(fileId);
  if (file.mimeType === FOLDER_MIME || !(await isDescendant(file.id, rootId))) {
    throw Object.assign(new Error("That file is outside the assigned client folder."), { status: 404 });
  }
  if (!file.modifiedTime || (expectedVersion && file.modifiedTime !== expectedVersion)) {
    throw Object.assign(new Error("This Drive file changed. Refresh it before taking action."), { status: 409 });
  }
  return file;
}

async function assertClientVisibleFile(profileId: number, rootId: string, fileId: string, expectedVersion?: string) {
  const file = await assertCurrentFile(profileId, rootId, fileId, expectedVersion);
  const visibility = await visibilityFor(profileId, fileId);
  if (!hasCurrentVisibleVersion(visibility, file)) {
    throw Object.assign(new Error("This file is not available in the client delivery portal."), { status: 404 });
  }
  return { file, visibility };
}

async function recheckTransferredFileAccess(
  userId: string,
  email: string | null,
  profileId: number,
  expectedRootId: string,
  fileId: string,
  expectedModifiedTime: string,
) {
  const profile = await accessibleProfile(userId, email, profileId);
  if (!profile?.drive_folder_id || profile.drive_folder_id !== expectedRootId) {
    throw Object.assign(new Error("Client file access is no longer available for this account."), { status: 404 });
  }
  const current = await assertClientVisibleFile(profile.id, profile.drive_folder_id, fileId, expectedModifiedTime);
  return { profile, ...current };
}

async function paymentEligibility(profileId: number) {
  const [row] = await db.select().from(deliveryPaymentEligibilityTable)
    .where(eq(deliveryPaymentEligibilityTable.corporate_profile_id, profileId)).limit(1);
  return row;
}

async function latestDecision(profileId: number, fileId: string, modifiedTime: string | undefined) {
  if (!modifiedTime) return undefined;
  const [row] = await db.select().from(driveFileDecisionsTable)
    .where(and(
      eq(driveFileDecisionsTable.corporate_profile_id, profileId),
      eq(driveFileDecisionsTable.drive_file_id, fileId),
      eq(driveFileDecisionsTable.drive_modified_time, modifiedTime),
    ))
    .orderBy(desc(driveFileDecisionsTable.created_at)).limit(1);
  return row;
}

async function audit(profileId: number, req: Express.Request, action: string, details: Record<string, unknown>, file?: DriveFile) {
  return auditWith(db, profileId, req, action, details, file);
}

async function auditWith(database: Pick<typeof db, "insert">, profileId: number, req: Express.Request, action: string, details: Record<string, unknown>, file?: DriveFile) {
  const userId = req.userId;
  if (!userId) return;
  await database.insert(deliveryAuditLogTable).values({
    corporate_profile_id: profileId,
    action,
    actor_user_id: userId,
    actor_role: req.user?.role || "user",
    drive_file_id: file?.id,
    drive_modified_time: file?.modifiedTime,
    details,
  });
}

async function lockedDeliveryProfile(transaction: Parameters<Parameters<typeof db.transaction>[0]>[0], profileId: number) {
  const [profile] = await transaction.select().from(corporateBrandProfilesTable)
    .where(eq(corporateBrandProfilesTable.id, profileId)).for("update").limit(1);
  return profile;
}

async function listFolder(profile: typeof corporateBrandProfilesTable.$inferSelect, folderId: string, admin = false) {
  const current = await fileMetadata(folderId);
  if (current.mimeType !== FOLDER_MIME) throw Object.assign(new Error("The selected item is not a folder."), { status: 400 });
  const result = await folderChildren(folderId);
  const files: Array<Record<string, unknown>> = [];
  for (const file of result.files || []) {
    if (file.mimeType === FOLDER_MIME) {
      if (admin || await folderHasVisibleDescendant(profile.id, file.id)) {
        files.push({
          id: file.id, name: file.name, mime_type: file.mimeType, is_folder: true,
          size: null, modified_time: file.modifiedTime || null,
          ...(admin ? { visibility: null } : {}),
        });
      }
      continue;
    }
    const visibility = await visibilityFor(profile.id, file.id);
    if (admin) {
      const decision = await latestDecision(profile.id, file.id, file.modifiedTime);
      files.push({
        id: file.id, name: file.name, mime_type: file.mimeType, is_folder: false,
        size: file.size ? Number(file.size) : null, modified_time: file.modifiedTime || null,
        visibility: visibility?.visibility || "hidden",
        expected_version: visibility?.generation || 0,
        version_bound: Boolean(visibility && file.modifiedTime && visibility.drive_modified_time === file.modifiedTime),
        released_with_override: Boolean(visibility?.released_with_override),
        decision: decision ? {
          decision: decision.decision,
          note: decision.note,
          decided_at: decision.created_at,
          decided_by_email: decision.decided_by_email,
        } : null,
      });
    } else if (hasCurrentVisibleVersion(visibility, file)) {
      files.push(toClientItem(file, visibility));
    }
  }
  return {
    profile_id: profile.id,
    root: { id: profile.drive_folder_id, name: profile.drive_folder_name || "Client files" },
    current_folder: { id: current.id, name: current.name },
    breadcrumbs: await breadcrumbs(folderId, profile.drive_folder_id!),
    files,
    incomplete: Boolean(result.incompleteSearch || result.nextPageToken),
  };
}

router.put("/admin/client-setups/:id/drive-folder", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const setupId = parsePositiveId(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const folderId = parseFolderId(req.body?.folder);
  if (!setupId) { res.status(400).json({ error: "Invalid client setup." }); return; }
  if (!folderId) { res.status(400).json({ error: "Paste a valid Google Drive folder URL or folder ID." }); return; }
  const [setup] = await db.select().from(clientSetupsTable).where(eq(clientSetupsTable.id, setupId)).limit(1);
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  try {
    const folder = await fileMetadata(folderId);
    if (folder.mimeType !== FOLDER_MIME) { res.status(400).json({ error: "The selected Google Drive item is not a folder." }); return; }
    const payload = setup.payload && typeof setup.payload === "object" ? setup.payload as Record<string, unknown> : {};
    const corporate = payload.corporate && typeof payload.corporate === "object" ? payload.corporate as Record<string, unknown> : {};
    await db.update(clientSetupsTable).set({
      payload: { ...payload, corporate: { ...corporate, drive_folder_id: folder.id, drive_folder_name: folder.name } },
    }).where(eq(clientSetupsTable.id, setup.id));
    if (setup.status === "claimed" && setup.claimed_user_id) {
      const [profile] = await db.update(corporateBrandProfilesTable).set({ drive_folder_id: folder.id, drive_folder_name: folder.name })
        .where(eq(corporateBrandProfilesTable.user_id, setup.claimed_user_id)).returning();
      if (!profile) { res.status(404).json({ error: "Corporate brand profile not found." }); return; }
    }
    res.json({ folder: { id: folder.id, name: folder.name } });
  } catch (error) {
    req.log.warn({ error, setupId }, "Drive folder validation failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.delete("/admin/client-setups/:id/drive-folder", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const setupId = parsePositiveId(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [setup] = setupId ? await db.select().from(clientSetupsTable).where(eq(clientSetupsTable.id, setupId)).limit(1) : [];
  if (!setup) { res.status(404).json({ error: "Client setup not found." }); return; }
  if (setup.status === "claimed" && setup.claimed_user_id) {
    await db.update(corporateBrandProfilesTable).set({ drive_folder_id: null, drive_folder_name: null })
      .where(eq(corporateBrandProfilesTable.user_id, setup.claimed_user_id));
  }
  const payload = setup.payload && typeof setup.payload === "object" ? setup.payload as Record<string, unknown> : {};
  const corporate = payload.corporate && typeof payload.corporate === "object" ? payload.corporate as Record<string, unknown> : {};
  const { drive_folder_id: _id, drive_folder_name: _name, ...rest } = corporate;
  await db.update(clientSetupsTable).set({ payload: { ...payload, corporate: rest } }).where(eq(clientSetupsTable.id, setup.id));
  res.status(204).send();
});

router.get("/drive/files", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const profileId = req.query.profile_id === undefined ? undefined : parsePositiveId(req.query.profile_id) || -1;
  const profile = await accessibleProfile(userId, req.user?.email || null, profileId);
  if (!profile) { res.status(404).json({ error: "Corporate client files are not available for this account." }); return; }
  preventClientCaching(res);
  if (!profile.drive_folder_id) { res.json({ profile_id: profile.id, root: null, current_folder: null, breadcrumbs: [], files: [] }); return; }
  const folderId = driveParam(req.query.folder_id) || profile.drive_folder_id;
  try {
    if (!(await isDescendant(folderId, profile.drive_folder_id))) { res.status(404).json({ error: "That folder is outside the assigned client folder." }); return; }
    if (folderId !== profile.drive_folder_id && !(await folderHasVisibleDescendant(profile.id, folderId))) {
      res.status(404).json({ error: "That folder is not available in the client delivery portal." }); return;
    }
    res.json(await listFolder(profile, folderId));
  } catch (error) {
    req.log.warn({ error, profileId: profile.id }, "Drive folder listing failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.get("/drive/files/:fileId/preview", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const profileId = parsePositiveId(req.query.profile_id);
  const profile = profileId ? await accessibleProfile(userId, req.user?.email || null, profileId) : undefined;
  const fileId = driveParam(Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId);
  const page = previewPage(req.query.page);
  if (!profile?.drive_folder_id || !fileId) { res.status(404).json({ error: "Client file access was not found." }); return; }
  if (!page) { res.status(400).json({ error: "Preview page must be a positive integer no greater than 25." }); return; }
  preventClientCaching(res);
  try {
    const { file } = await assertClientVisibleFile(profile.id, profile.drive_folder_id, fileId);
    if (!(file.mimeType === "application/pdf" || file.mimeType.startsWith("image/"))) {
      res.status(415).json({ error: "Review preview currently supports Drive images and PDFs only." }); return;
    }
    const response = await connector().proxy("google-drive", `/drive/v3/files/${encodeURIComponent(file.id)}?alt=media&supportsAllDrives=true`, { method: "GET" });
    if (!response.ok) throw Object.assign(new Error("The file could not be previewed from Google Drive."), { status: response.status, upstream: true });
    const sourceBytes = await readLimitedBody(response, MAX_PREVIEW_INPUT_BYTES);
    // Recheck after receiving Drive bytes so changed/replaced source bytes
    // cannot be attached to the already-authorized live modifiedTime.
    await recheckTransferredFileAccess(userId, req.user?.email || null, profile.id, profile.drive_folder_id, fileId, file.modifiedTime!);
    const preview = await generateDrivePreview({ bytes: sourceBytes, mimeType: file.mimeType, page });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", String(preview.bytes.byteLength));
    res.setHeader("Content-Disposition", `inline; filename="review-preview-page-${page}.png"`);
    res.setHeader("X-Preview-Page-Count", String(preview.pageCount));
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(preview.bytes);
  } catch (error) {
    req.log.warn({ error, profileId, fileId }, "Drive preview failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.get("/drive/files/:fileId/download", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const profileId = parsePositiveId(req.query.profile_id);
  const profile = profileId ? await accessibleProfile(userId, req.user?.email || null, profileId) : undefined;
  const fileId = driveParam(Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId);
  if (!profile?.drive_folder_id || !fileId) { res.status(404).json({ error: "Client file access was not found." }); return; }
  preventClientCaching(res);
  try {
    const { file, visibility } = await assertClientVisibleFile(profile.id, profile.drive_folder_id, fileId);
    if (visibility.visibility !== "released") { res.status(403).json({ error: "This file has not been released for download." }); return; }
    const payment = await paymentEligibility(profile.id);
    if (!payment?.confirmed_paid_in_full && !visibility.released_with_override) {
      res.status(403).json({ error: "Final downloads are unavailable until the account is manually confirmed paid in full." }); return;
    }
    const size = file.size ? Number(file.size) : 0;
    if (size > MAX_TRANSFER_BYTES) { res.status(413).json({ error: "This file is larger than the 50 MB portal transfer limit." }); return; }
    const response = await connector().proxy("google-drive", `/drive/v3/files/${encodeURIComponent(file.id)}?alt=media&supportsAllDrives=true`, { method: "GET" });
    if (!response.ok) throw Object.assign(new Error("The file could not be downloaded from Google Drive."), { status: response.status, upstream: true });
    const bytes = await readLimitedBody(response);
    const refreshed = await recheckTransferredFileAccess(userId, req.user?.email || null, profile.id, profile.drive_folder_id, fileId, file.modifiedTime!);
    if (refreshed.visibility.visibility !== "released") {
      res.status(403).json({ error: "This file has not been released for download." }); return;
    }
    const refreshedPayment = await paymentEligibility(refreshed.profile.id);
    if (!refreshedPayment?.confirmed_paid_in_full && !refreshed.visibility.released_with_override) {
      res.status(403).json({ error: "Final downloads are unavailable until the account is manually confirmed paid in full." }); return;
    }
    const name = safeFilename(file.name);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Content-Length", String(bytes.byteLength));
    res.setHeader("Content-Disposition", `attachment; filename="${name.replaceAll('"', "")}"; filename*=UTF-8''${encodeURIComponent(name)}`);
    res.send(bytes);
  } catch (error) {
    req.log.warn({ error, profileId, fileId }, "Drive file download failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.get("/drive/files/:fileId/comments", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const profileId = parsePositiveId(req.query.profile_id);
  const profile = profileId ? await accessibleProfile(userId, req.user?.email || null, profileId) : undefined;
  const fileId = driveParam(Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId);
  if (!profile?.drive_folder_id || !fileId) { res.status(404).json({ error: "Client file access was not found." }); return; }
  preventClientCaching(res);
  try {
    const { file } = await assertClientVisibleFile(profile.id, profile.drive_folder_id, fileId);
    const rows = await db.select().from(driveFileCommentsTable)
      .where(and(eq(driveFileCommentsTable.corporate_profile_id, profile.id), eq(driveFileCommentsTable.drive_file_id, fileId), eq(driveFileCommentsTable.drive_modified_time, file.modifiedTime!)))
      .orderBy(desc(driveFileCommentsTable.created_at));
    res.json({ file_id: fileId, modified_time: file.modifiedTime, comments: rows.map((row) => ({
      id: row.id, body: row.body, author_email: row.author_email, created_at: row.created_at,
    })) });
  } catch (error) {
    req.log.warn({ error, profileId, fileId }, "Drive comment listing failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.post("/drive/files/:fileId/comments", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const profileId = parsePositiveId(req.query.profile_id);
  const profile = profileId ? await accessibleProfile(userId, req.user?.email || null, profileId) : undefined;
  const fileId = driveParam(Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId);
  const body = nonBlank(req.body?.body);
  const modifiedTime = version(req.body?.modified_time);
  if (!profile?.drive_folder_id || !fileId) { res.status(404).json({ error: "Client file access was not found." }); return; }
  if (!body || !modifiedTime) { res.status(400).json({ error: "A comment and the current Drive version are required." }); return; }
  try {
    const { file } = await assertClientVisibleFile(profile.id, profile.drive_folder_id, fileId, modifiedTime);
    const comment = await db.transaction(async (transaction) => {
      await lockedDeliveryProfile(transaction, profile.id);
      const [visibility] = await transaction.select().from(driveFileVisibilityTable)
        .where(and(eq(driveFileVisibilityTable.corporate_profile_id, profile.id), eq(driveFileVisibilityTable.drive_file_id, file.id)))
        .for("update").limit(1);
      if (!hasCurrentVisibleVersion(visibility, file)) {
        throw Object.assign(new Error("This file is no longer available in the client delivery portal."), { status: 409 });
      }
      const [created] = await transaction.insert(driveFileCommentsTable).values({
        corporate_profile_id: profile.id, drive_file_id: file.id, drive_modified_time: file.modifiedTime!,
        author_user_id: userId, author_email: req.user?.email || null, body,
      }).returning();
      await auditWith(transaction, profile.id, req, "client_comment_added", { comment_id: created.id }, file);
      return created;
    });
    res.status(201).json({ id: comment.id, body: comment.body, author_email: comment.author_email, created_at: comment.created_at, modified_time: comment.drive_modified_time });
  } catch (error) {
    req.log.warn({ error, profileId, fileId }, "Drive comment creation failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.post("/drive/files/:fileId/decision", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const profileId = parsePositiveId(req.query.profile_id);
  const profile = profileId ? await accessibleProfile(userId, req.user?.email || null, profileId) : undefined;
  const fileId = driveParam(Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId);
  const decision = req.body?.decision === "approved" || req.body?.decision === "revision_requested" ? req.body.decision : null;
  const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 10_000) : null;
  const modifiedTime = version(req.body?.modified_time);
  if (!profile?.drive_folder_id || !fileId) { res.status(404).json({ error: "Client file access was not found." }); return; }
  if (!decision || !modifiedTime || (decision === "revision_requested" && !note)) {
    res.status(400).json({ error: "A current Drive version is required, and revision requests require a note." }); return;
  }
  if (!isCorporateAdmin(profile, userId, req.user?.email || null)) { res.status(403).json({ error: "Only the corporate owner or designated corporate admins can decide." }); return; }
  try {
    const { file } = await assertClientVisibleFile(profile.id, profile.drive_folder_id, fileId, modifiedTime);
    const record = await db.transaction(async (transaction) => {
      await lockedDeliveryProfile(transaction, profile.id);
      const [visibility] = await transaction.select().from(driveFileVisibilityTable)
        .where(and(eq(driveFileVisibilityTable.corporate_profile_id, profile.id), eq(driveFileVisibilityTable.drive_file_id, file.id)))
        .for("update").limit(1);
      if (!hasCurrentVisibleVersion(visibility, file)) {
        throw Object.assign(new Error("This file is no longer available in the client delivery portal."), { status: 409 });
      }
      const [created] = await transaction.insert(driveFileDecisionsTable).values({
        corporate_profile_id: profile.id, drive_file_id: file.id, drive_modified_time: file.modifiedTime!,
        decision, note, decided_by_user_id: userId, decided_by_email: req.user?.email || null,
      }).returning();
      await auditWith(transaction, profile.id, req, `client_${decision}`, { decision_id: created.id, note_provided: Boolean(note) }, file);
      return created;
    });
    res.status(201).json({ id: record.id, decision: record.decision, note: record.note, modified_time: record.drive_modified_time, created_at: record.created_at });
  } catch (error) {
    req.log.warn({ error, profileId, fileId }, "Drive decision creation failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.get("/admin/delivery-accounts/:profileId/drive-files", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const profileId = parsePositiveId(Array.isArray(req.params.profileId) ? req.params.profileId[0] : req.params.profileId);
  if (!profileId) { res.status(400).json({ error: "Invalid delivery account." }); return; }
  const profile = await adminProfile(profileId);
  if (!profile?.drive_folder_id) { res.status(404).json({ error: "Corporate delivery folder was not found." }); return; }
  const folderId = driveParam(req.query.folder_id) || profile.drive_folder_id;
  try {
    if (!(await isDescendant(folderId, profile.drive_folder_id))) { res.status(404).json({ error: "That folder is outside the assigned client folder." }); return; }
    res.json(await listFolder(profile, folderId, true));
  } catch (error) {
    req.log.warn({ error, profileId }, "Agency Drive folder listing failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.put("/admin/delivery-accounts/:profileId/drive-files/:fileId/visibility", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const profileId = parsePositiveId(Array.isArray(req.params.profileId) ? req.params.profileId[0] : req.params.profileId);
  const fileId = driveParam(Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId);
  const visibility = typeof req.body?.visibility === "string" && VISIBILITY_STATES.has(req.body.visibility) ? req.body.visibility : null;
  const modifiedTime = version(req.body?.modified_time);
  const expectedVersion = expectedGeneration(req.body?.expected_version);
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 10_000) : null;
  if (!profileId || !fileId || !visibility || !modifiedTime || expectedVersion === null) { res.status(400).json({ error: "Visibility, expected version, and the current Drive version are required." }); return; }
  const profile = await adminProfile(profileId);
  if (!profile?.drive_folder_id) { res.status(404).json({ error: "Corporate delivery folder was not found." }); return; }
  try {
    const file = await assertCurrentFile(profile.id, profile.drive_folder_id, fileId, modifiedTime);
    const result = await db.transaction(async (transaction) => {
      await lockedDeliveryProfile(transaction, profile.id);
      const [previous] = await transaction.select().from(driveFileVisibilityTable)
        .where(and(eq(driveFileVisibilityTable.corporate_profile_id, profile.id), eq(driveFileVisibilityTable.drive_file_id, file.id)))
        .for("update").limit(1);
      if ((previous?.generation || 0) !== expectedVersion) {
        throw Object.assign(new Error("This file visibility changed. Refresh before saving."), { status: 409 });
      }
      const [payment] = visibility === "released"
        ? await transaction.select().from(deliveryPaymentEligibilityTable)
          .where(eq(deliveryPaymentEligibilityTable.corporate_profile_id, profile.id)).for("update").limit(1)
        : [];
      const superOverride = visibility === "released" && !payment?.confirmed_paid_in_full;
      if (superOverride && (req.user?.role !== "super_admin" || !reason)) {
        throw Object.assign(new Error("Releasing before manual paid-in-full confirmation requires a Super Admin override reason."), { status: 403 });
      }
      const values = {
        visibility, drive_modified_time: file.modifiedTime!, released_with_override: superOverride,
        set_by_user_id: req.userId!, reason: reason || null, generation: expectedVersion + 1,
      };
      if (previous) {
        await transaction.update(driveFileVisibilityTable).set(values).where(eq(driveFileVisibilityTable.id, previous.id));
      } else {
        await transaction.insert(driveFileVisibilityTable).values({ corporate_profile_id: profile.id, drive_file_id: file.id, ...values });
      }
      await auditWith(transaction, profile.id, req, superOverride ? "release_override" : `visibility_${visibility}`, {
        previous_visibility: previous?.visibility || "unmanaged", reason: reason || null, generation: expectedVersion + 1,
      }, file);
      return { superOverride, generation: expectedVersion + 1 };
    });
    res.json({ file_id: file.id, visibility, modified_time: file.modifiedTime, released_with_override: result.superOverride, expected_version: result.generation });
  } catch (error) {
    req.log.warn({ error, profileId, fileId }, "Agency Drive visibility update failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.get("/admin/delivery-accounts/:profileId/payment-eligibility", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const profileId = parsePositiveId(Array.isArray(req.params.profileId) ? req.params.profileId[0] : req.params.profileId);
  if (!profileId || !(await adminProfile(profileId))) { res.status(404).json({ error: "Corporate delivery account was not found." }); return; }
  const payment = await paymentEligibility(profileId);
  res.json({
    confirmed_paid_in_full: Boolean(payment?.confirmed_paid_in_full),
    confirmed_at: payment?.confirmed_at || null, confirmed_by_user_id: payment?.confirmed_by_user_id || null,
    evidence: payment?.evidence || null, reason: payment?.reason || null, source: "manual",
    expected_version: payment?.generation || 0,
  });
});

router.put("/admin/delivery-accounts/:profileId/payment-eligibility", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const profileId = parsePositiveId(Array.isArray(req.params.profileId) ? req.params.profileId[0] : req.params.profileId);
  const confirmed = typeof req.body?.confirmed_paid_in_full === "boolean" ? req.body.confirmed_paid_in_full : null;
  const evidence = nonBlank(req.body?.evidence);
  const reason = nonBlank(req.body?.reason);
  const expectedVersion = expectedGeneration(req.body?.expected_version);
  if (!profileId || confirmed === null || !evidence || !reason || expectedVersion === null) {
    res.status(400).json({ error: "Manual paid-in-full status, evidence, internal reason, and expected version are required." }); return;
  }
  if (!(await adminProfile(profileId))) { res.status(404).json({ error: "Corporate delivery account was not found." }); return; }
  const result = await db.transaction(async (transaction) => {
    await lockedDeliveryProfile(transaction, profileId);
    const [previous] = await transaction.select().from(deliveryPaymentEligibilityTable)
      .where(eq(deliveryPaymentEligibilityTable.corporate_profile_id, profileId)).for("update").limit(1);
    if ((previous?.generation || 0) !== expectedVersion) {
      throw Object.assign(new Error("Payment eligibility changed. Refresh before saving."), { status: 409 });
    }
    const values = {
      confirmed_paid_in_full: confirmed, confirmed_at: confirmed ? new Date() : null,
      confirmed_by_user_id: req.userId!, evidence, reason, generation: expectedVersion + 1,
    };
    if (previous) {
      await transaction.update(deliveryPaymentEligibilityTable).set(values).where(eq(deliveryPaymentEligibilityTable.id, previous.id));
    } else {
      await transaction.insert(deliveryPaymentEligibilityTable).values({ corporate_profile_id: profileId, ...values });
    }
    await auditWith(transaction, profileId, req, confirmed ? "payment_confirmed_paid_in_full" : "payment_confirmation_revoked", {
      previous_confirmed_paid_in_full: Boolean(previous?.confirmed_paid_in_full), evidence, reason, source: "manual", generation: expectedVersion + 1,
    });
    return values;
  });
  res.json({ confirmed_paid_in_full: confirmed, confirmed_at: result.confirmed_at, confirmed_by_user_id: result.confirmed_by_user_id, evidence, reason, source: "manual", expected_version: result.generation });
});

router.get("/admin/delivery-accounts/:profileId/delivery-audit", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const profileId = parsePositiveId(Array.isArray(req.params.profileId) ? req.params.profileId[0] : req.params.profileId);
  const requestedLimit = parsePositiveId(req.query.limit);
  const limit = requestedLimit ? Math.min(requestedLimit, 200) : 100;
  if (!profileId || !(await adminProfile(profileId))) { res.status(404).json({ error: "Corporate delivery account was not found." }); return; }
  const events = await db.select().from(deliveryAuditLogTable)
    .where(eq(deliveryAuditLogTable.corporate_profile_id, profileId))
    .orderBy(desc(deliveryAuditLogTable.created_at)).limit(limit);
  res.json({ events });
});

export const driveFilesTestables = {
  parseFolderId, safeFilename, corporateMemberCanView, readLimitedBody, hasCurrentVisibleVersion, isCorporateAdmin, previewPage, expectedGeneration,
};
export default router;