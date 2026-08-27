import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});

const sensitiveKeyPattern = /(authorization|cookie|password|secret|token|credential|private.?key|client.?secret)/i;

/**
 * Keep provider troubleshooting useful without allowing credentials or raw
 * provider payloads into logs and support bundles.
 */
export function sanitizeSupportDetails(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[truncated]";
  if (typeof value === "string") return value.length > 2000 ? `${value.slice(0, 2000)}…` : value;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitizeSupportDetails(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).slice(0, 100).map(([key, item]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[redacted]" : sanitizeSupportDetails(item, depth + 1),
      ]),
    );
  }
  return value;
}

export function redactSupportText(value: string): string {
  return value.replace(
    /\b(authorization|access[_ -]?token|refresh[_ -]?token|client[_ -]?secret|password|secret)\b\s*[:=]\s*\S+/gi,
    "$1=[redacted]",
  );
}

type HeaderReader = { get(name: string): string | null } | Record<string, string | string[] | undefined>;

export function getIntuitTid(headers: HeaderReader): string | null {
  const fromGetter = "get" in headers && typeof headers.get === "function"
    ? headers.get("intuit_tid") ?? headers.get("Intuit-Tid")
    : undefined;
  if (fromGetter) return fromGetter.trim().slice(0, 256) || null;

  const record = headers as Record<string, string | string[] | undefined>;
  const key = Object.keys(record).find((name) => name.toLowerCase() === "intuit_tid");
  const value = key ? record[key] : undefined;
  const tid = Array.isArray(value) ? value[0] : value;
  return typeof tid === "string" ? tid.trim().slice(0, 256) || null : null;
}

export function inspectQuickBooksResponse(
  response: { status: number; headers: HeaderReader },
  safeResponseDetails?: unknown,
  requestContext?: unknown,
) {
  return {
    provider: "quickbooks",
    provider_status: response.status,
    safe_response_details: sanitizeSupportDetails(safeResponseDetails ?? {}),
    request_context: sanitizeSupportDetails(requestContext ?? {}),
    intuit_tid: getIntuitTid(response.headers),
  };
}

export function logQuickBooksResponse(
  log: { warn: (object: object, message: string) => void },
  event: ReturnType<typeof inspectQuickBooksResponse>,
) {
  log.warn(event, "QuickBooks provider response captured for support");
}
