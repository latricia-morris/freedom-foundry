import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Security scan for member uploads on the project request form.
// Verifies the stored file's actual bytes match its declared type and rejects
// anything that is not an accepted document/image/text format.

const MAX_BYTES = 10 * 1024 * 1024;

const SIGNATURES = [
  { ext: 'png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: 'jpg', bytes: [0xff, 0xd8, 0xff] },
  { ext: 'jpeg', bytes: [0xff, 0xd8, 0xff] },
  { ext: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { ext: 'pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { ext: 'docx', bytes: [0x50, 0x4b, 0x03, 0x04] },
  { ext: 'txt', bytes: null },
  { ext: 'csv', bytes: null },
];

function looksLikeText(bytes) {
  const head = bytes.subarray(0, 2048);
  if (head.length === 0) return false;
  for (const b of head) if (b === 0) return false;
  let printable = 0;
  for (const b of head) {
    if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127) || b >= 128) printable += 1;
  }
  return printable / head.length > 0.9;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const fileUri = String(body.file_uri || '');
    const filename = String(body.filename || '');
    if (!fileUri) return Response.json({ error: 'A file is required.' }, { status: 400 });

    const declaredExt = (filename.split('.').pop() || '').toLowerCase();
    const entry = SIGNATURES.find((s) => s.ext === declaredExt);
    if (!entry) return Response.json({ ok: false, reason: 'This file type is not accepted.' });

    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri });
    const signedUrl = signed?.signed_url || signed?.data?.signed_url;
    if (!signedUrl) return Response.json({ ok: false, reason: 'The file could not be opened for scanning.' });

    const res = await fetch(signedUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return Response.json({ ok: false, reason: 'The file could not be opened for scanning.' });
    const buf = new Uint8Array(await res.arrayBuffer());

    if (buf.byteLength === 0) return Response.json({ ok: false, reason: 'The file is empty.' });
    if (buf.byteLength > MAX_BYTES) return Response.json({ ok: false, reason: 'Files must be 10 MB or smaller.' });

    let detected = declaredExt;
    if (entry.bytes) {
      const matches = entry.bytes.every((b, i) => buf[i] === b);
      if (!matches) {
        return Response.json({ ok: false, reason: 'The file contents do not match its type and were rejected.' });
      }
    } else if (!looksLikeText(buf)) {
      return Response.json({ ok: false, reason: 'The file contents do not match its type and were rejected.' });
    }

    return Response.json({ ok: true, detected_type: detected, bytes: buf.byteLength, scanned_at: new Date().toISOString() });
  } catch (error) {
    console.error('scan-upload error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}