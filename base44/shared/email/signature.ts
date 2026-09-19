// Resend signs webhook payloads in the svix format: HMAC-SHA256 over
// "{svix-id}.{svix-timestamp}.{rawBody}", delivered in the `svix-signature`
// header as one or more "v1,<base64>" segments. Signature verification is
// required on every request — the endpoint is publicly reachable.

export async function verifyResendSignature(headers, rawBody, secret) {
  const svixId = headers.get('svix-id');
  const svixTimestamp = headers.get('svix-timestamp');
  const svixSignature = headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature || !rawBody) return false;

  // Reject stale or replayed deliveries (5-minute window).
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(svixTimestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${svixId}.${svixTimestamp}.${rawBody}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(digest)));

  return svixSignature
    .split(' ')
    .some((part) => part.startsWith('v1,') && part.slice(3) === expected);
}