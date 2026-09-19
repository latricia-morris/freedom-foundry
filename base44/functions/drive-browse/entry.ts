import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const LIST_FIELDS = 'nextPageToken,files(id,name,mimeType,size,modifiedTime)';

async function getDriveToken(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
  if (!accessToken) throw new Error('The Google Drive connection is not available.');
  return accessToken;
}

async function driveFetch(token, url) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Google Drive request failed (${response.status}): ${detail.slice(0, 180)}`);
  }
  return response;
}

async function memberFolderRoots(base44, userId) {
  const rows = await base44.entities.PortalContent
    .filter({ type: 'drive_link', user_id: userId }, '-created_date', 100)
    .catch(() => []);
  const roots = (rows || []).map((row) => row.drive_folder_id).filter(Boolean);
  return [...new Set(roots)];
}

async function descendsFromRoot(token, folderId, roots, depth = 0) {
  if (roots.includes(folderId)) return true;
  if (depth >= 15) return false;
  const response = await driveFetch(
    token,
    `${DRIVE_API}/files/${encodeURIComponent(folderId)}?fields=parents&supportsAllDrives=true`
  );
  const meta = await response.json();
  for (const parent of meta.parents || []) {
    if (roots.includes(parent)) return true;
    if (await descendsFromRoot(token, parent, roots, depth + 1)) return true;
  }
  return false;
}

function mapDriveItem(item) {
  return {
    id: item.id,
    name: item.name,
    mimeType: item.mimeType || '',
    isFolder: item.mimeType === 'application/vnd.google-apps.folder',
    size: item.size ? Number(item.size) : 0,
    modifiedTime: item.modifiedTime || '',
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'browse';
    const isAdmin = user.role === 'admin';
    const token = await getDriveToken(base44);

    if (action === 'browse') {
      let folderId = body.folderId || '';
      if (!isAdmin) {
        const roots = await memberFolderRoots(base44, user.id);
        if (!roots.length) {
          return Response.json({ error: 'No shared folder is linked to your account yet.' }, { status: 403 });
        }
        if (!folderId || folderId === 'root') {
          folderId = roots[0];
        } else if (!roots.includes(folderId)) {
          const allowed = await descendsFromRoot(token, folderId, roots);
          if (!allowed) {
            return Response.json({ error: 'This folder is not part of your shared brand files.' }, { status: 403 });
          }
        }
      } else if (!folderId) {
        folderId = 'root';
      }

      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
      const listUrl = `${DRIVE_API}/files?q=${query}&pageSize=100&orderBy=folder,modifiedTime desc&fields=${encodeURIComponent(LIST_FIELDS)}&supportsAllDrives=true&includeItemsFromAllDrives=true`;
      const listResponse = await driveFetch(token, listUrl);
      const page = await listResponse.json();

      let folderName = '';
      if (folderId === 'root') {
        folderName = 'My Drive';
      } else {
        const metaResponse = await driveFetch(
          token,
          `${DRIVE_API}/files/${encodeURIComponent(folderId)}?fields=name&supportsAllDrives=true`
        );
        const meta = await metaResponse.json();
        folderName = meta.name || '';
      }

      return Response.json({
        folderId,
        folderName,
        files: (page.files || []).map(mapDriveItem),
      });
    }

    if (action === 'file') {
      const fileId = body.fileId || '';
      if (!fileId) return Response.json({ error: 'Missing file id.' }, { status: 400 });
      const metaResponse = await driveFetch(
        token,
        `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,parents&supportsAllDrives=true`
      );
      const meta = await metaResponse.json();

      if (!isAdmin) {
        const roots = await memberFolderRoots(base44, user.id);
        if (!roots.length) {
          return Response.json({ error: 'No shared folder is linked to your account yet.' }, { status: 403 });
        }
        let allowed = false;
        for (const parent of meta.parents || []) {
          if (roots.includes(parent) || (await descendsFromRoot(token, parent, roots))) {
            allowed = true;
            break;
          }
        }
        if (!allowed) {
          return Response.json({ error: 'This file is not part of your shared brand files.' }, { status: 403 });
        }
      }

      const size = Number(meta.size || 0);
      if (size > MAX_FILE_BYTES) {
        return Response.json({ error: 'This file is too large to open in the portal (over 10 MB).' }, { status: 413 });
      }

      const mediaResponse = await driveFetch(
        token,
        `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`
      );
      const buffer = await mediaResponse.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const dataUrl = `data:${meta.mimeType || 'application/octet-stream'};base64,${btoa(binary)}`;
      return Response.json({
        file: { id: meta.id, name: meta.name, mimeType: meta.mimeType, size: meta.size, dataUrl },
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'The Drive request failed.' }, { status: 500 });
  }
}