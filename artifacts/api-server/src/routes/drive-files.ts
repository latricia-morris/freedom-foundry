import { Router, type IRouter } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { corporateBrandProfilesTable, clientSetupsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, requireAdmin, requireMemberId } from "../lib/auth";

const router: IRouter = Router();
const FOLDER_MIME = "application/vnd.google-apps.folder";
const GOOGLE_MIME_PREFIX = "application/vnd.google-apps.";
const PDF_EXPORTABLE_GOOGLE_MIMES = new Set([
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
  "application/vnd.google-apps.drawing",
]);
const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024;

type CorporateMember = { email?: unknown; permissions?: unknown; role?: unknown };
type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
};

function connector() {
  return new ReplitConnectors();
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

function escapeDriveQuery(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

async function driveJson<T = Record<string, unknown>>(path: string): Promise<T> {
  const response = await connector().proxy("google-drive", path, { method: "GET" });
  if (!response.ok) {
    const error = new Error(response.status === 404
      ? "The Google Drive item is missing or no longer accessible."
      : "Google Drive access is unavailable. Reconnect the integration or check the folder permissions.");
    Object.assign(error, { status: response.status });
    throw error;
  }
  return response.json() as Promise<T>;
}

async function readLimitedBody(response: Response, limit = MAX_DOWNLOAD_BYTES) {
  const declaredSize = Number(response.headers.get("content-length") || 0);
  if (Number.isFinite(declaredSize) && declaredSize > limit) {
    await response.body?.cancel();
    throw Object.assign(new Error("This file is larger than the 50 MB portal download limit."), { status: 413 });
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
        throw Object.assign(new Error("This file is larger than the 50 MB portal download limit."), { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}

function routeErrorStatus(error: unknown) {
  const status = Number((error as { status?: number }).status);
  return status === 404 || status === 413 || status === 415 ? status : 502;
}

async function fileMetadata(fileId: string): Promise<DriveFile> {
  const fields = "id,name,mimeType,size,modifiedTime,parents,webViewLink,trashed";
  const file = await driveJson<DriveFile & { trashed?: boolean }>(`/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true&fields=${encodeURIComponent(fields)}`);
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
      const item = await fileMetadata(id);
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

function safeFilename(name: string) {
  const cleaned = name.replace(/[\u0000-\u001f\u007f"\\/:*?<>|]+/g, "_").trim();
  return (cleaned || "download").slice(0, 180);
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
      const [profile] = await db.update(corporateBrandProfilesTable)
        .set({ drive_folder_id: folder.id, drive_folder_name: folder.name })
        .where(eq(corporateBrandProfilesTable.user_id, setup.claimed_user_id)).returning();
      if (!profile) { res.status(404).json({ error: "Corporate brand profile not found." }); return; }
    }
    res.json({ folder: { id: folder.id, name: folder.name, web_view_link: folder.webViewLink || null } });
  } catch (error) {
    req.log.warn({ error, setupId }, "Drive folder validation failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.delete("/admin/client-setups/:id/drive-folder", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const setupId = parsePositiveId(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [setup] = setupId
    ? await db.select().from(clientSetupsTable).where(eq(clientSetupsTable.id, setupId)).limit(1)
    : [];
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
  if (!profile.drive_folder_id) {
    res.json({ profile_id: profile.id, root: null, current_folder: null, breadcrumbs: [], files: [] });
    return;
  }
  const folderId = typeof req.query.folder_id === "string" ? req.query.folder_id : profile.drive_folder_id;
  try {
    if (!(await isDescendant(folderId, profile.drive_folder_id))) {
      res.status(404).json({ error: "That folder is outside the assigned client folder." }); return;
    }
    const current = await fileMetadata(folderId);
    if (current.mimeType !== FOLDER_MIME) { res.status(400).json({ error: "The selected item is not a folder." }); return; }
    const query = `'${escapeDriveQuery(folderId)}' in parents and trashed = false`;
    const fields = "nextPageToken,incompleteSearch,files(id,name,mimeType,size,modifiedTime,parents,webViewLink)";
    const result = await driveJson<{ files?: DriveFile[]; incompleteSearch?: boolean; nextPageToken?: string }>(`/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=1000&orderBy=folder,name&supportsAllDrives=true&includeItemsFromAllDrives=true`);
    res.json({
      profile_id: profile.id,
      root: { id: profile.drive_folder_id, name: profile.drive_folder_name || "Client files" },
      current_folder: { id: current.id, name: current.name },
      breadcrumbs: await breadcrumbs(folderId, profile.drive_folder_id),
      files: (result.files || []).map((file: DriveFile) => ({
        id: file.id, name: file.name, mime_type: file.mimeType,
        is_folder: file.mimeType === FOLDER_MIME,
        size: file.size ? Number(file.size) : null,
        modified_time: file.modifiedTime || null,
      })),
      incomplete: Boolean(result.incompleteSearch || result.nextPageToken),
    });
  } catch (error) {
    req.log.warn({ error, profileId: profile.id }, "Drive folder listing failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

router.get("/drive/files/:fileId/download", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const profileId = parsePositiveId(req.query.profile_id);
  const profile = profileId ? await accessibleProfile(userId, req.user?.email || null, profileId) : undefined;
  if (!profile?.drive_folder_id) { res.status(404).json({ error: "Client file access was not found." }); return; }
  const fileId = Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId;
  try {
    const file = await fileMetadata(fileId);
    if (file.mimeType === FOLDER_MIME || !(await isDescendant(file.id, profile.drive_folder_id))) {
      res.status(404).json({ error: "That file is outside the assigned client folder." }); return;
    }
    const size = file.size ? Number(file.size) : 0;
    if (size > MAX_DOWNLOAD_BYTES) {
      res.status(413).json({ error: "This file is larger than the 50 MB portal download limit. Open it in Google Drive instead." }); return;
    }
    const isGoogleFile = file.mimeType.startsWith(GOOGLE_MIME_PREFIX);
    if (isGoogleFile && !PDF_EXPORTABLE_GOOGLE_MIMES.has(file.mimeType)) {
      res.status(415).json({ error: "This Google Drive item cannot be downloaded as a file from the portal." }); return;
    }
    const path = isGoogleFile
      ? `/drive/v3/files/${encodeURIComponent(file.id)}/export?mimeType=application%2Fpdf`
      : `/drive/v3/files/${encodeURIComponent(file.id)}?alt=media&supportsAllDrives=true`;
    const response = await connector().proxy("google-drive", path, { method: "GET" });
    if (!response.ok) throw Object.assign(new Error("The file could not be downloaded from Google Drive."), { status: response.status });
    const bytes = await readLimitedBody(response);
    const name = safeFilename(isGoogleFile && !file.name.toLowerCase().endsWith(".pdf") ? `${file.name}.pdf` : file.name);
    res.setHeader("Content-Type", isGoogleFile ? "application/pdf" : response.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Content-Length", String(bytes.byteLength));
    res.setHeader("Content-Disposition", `attachment; filename="${name.replaceAll('"', "")}"; filename*=UTF-8''${encodeURIComponent(name)}`);
    res.send(bytes);
  } catch (error) {
    req.log.warn({ error, profileId, fileId }, "Drive file download failed");
    res.status(routeErrorStatus(error)).json({ error: (error as Error).message });
  }
});

export const driveFilesTestables = { parseFolderId, safeFilename, corporateMemberCanView, readLimitedBody };
export default router;