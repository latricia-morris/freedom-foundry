import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  supportProviderEventsTable,
  supportReportsTable,
} from "@workspace/db";
import {
  authMiddleware,
  requireAdmin,
  requireMemberId,
} from "../lib/auth";
import {
  inspectQuickBooksResponse,
  logQuickBooksResponse,
  redactSupportText,
  sanitizeSupportDetails,
} from "../lib/logger";

const router: IRouter = Router();
type Parsed<T> = { success: true; data: T } | { success: false; error: string };
type ReportInput = {
  description: string;
  provider: "quickbooks";
  page_context?: string;
  intuit_tid?: string;
  occurred_at?: string;
};
type ProviderEventInput = {
  support_report_id?: number;
  provider: "quickbooks";
  provider_status: number;
  safe_response_details?: unknown;
  request_context?: unknown;
  intuit_tid?: string | null;
};

function optionalTrimmedString(value: unknown, maxLength: number): string | undefined | null {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? (trimmed || undefined) : null;
}

function parseReportInput(value: unknown): Parsed<ReportInput> {
  const body = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  if (typeof body.description !== "string" || !body.description.trim() || body.description.trim().length > 5000) {
    return { success: false, error: "Describe the problem in 1–5000 characters" };
  }
  if (body.provider !== undefined && body.provider !== "quickbooks") {
    return { success: false, error: "Only QuickBooks reports are supported" };
  }
  const pageContext = optionalTrimmedString(body.page_context, 500);
  const intuitTid = optionalTrimmedString(body.intuit_tid, 256);
  if (pageContext === null || intuitTid === null) {
    return { success: false, error: "Page context and intuit_tid must be valid text values" };
  }
  if (body.occurred_at !== undefined
    && (typeof body.occurred_at !== "string" || Number.isNaN(new Date(body.occurred_at).getTime()))) {
    return { success: false, error: "The report timestamp must be a valid ISO date" };
  }
  return {
    success: true,
    data: {
      description: body.description.trim(),
      provider: "quickbooks",
      ...(pageContext ? { page_context: pageContext } : {}),
      ...(intuitTid ? { intuit_tid: intuitTid } : {}),
      ...(typeof body.occurred_at === "string" ? { occurred_at: body.occurred_at } : {}),
    },
  };
}

function parseProviderEventInput(value: unknown): Parsed<ProviderEventInput> {
  const body = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  if (body.provider !== undefined && body.provider !== "quickbooks") {
    return { success: false, error: "Only QuickBooks events are supported" };
  }
  if (typeof body.provider_status !== "number"
    || !Number.isInteger(body.provider_status)
    || body.provider_status < 100
    || body.provider_status > 599) {
    return { success: false, error: "Provider status must be an HTTP status code" };
  }
  if (body.support_report_id !== undefined
    && (typeof body.support_report_id !== "number"
      || !Number.isInteger(body.support_report_id)
      || body.support_report_id < 1)) {
    return { success: false, error: "Support report ID must be a positive integer" };
  }
  const intuitTid = body.intuit_tid === null
    ? null
    : optionalTrimmedString(body.intuit_tid, 256);
  if (intuitTid === undefined) {
    return {
      success: true,
      data: {
        provider: "quickbooks",
        provider_status: body.provider_status,
        support_report_id: body.support_report_id as number | undefined,
        safe_response_details: body.safe_response_details,
        request_context: body.request_context,
      },
    };
  }
  if (intuitTid === null && body.intuit_tid !== null) {
    return { success: false, error: "intuit_tid must be valid text" };
  }
  return {
    success: true,
    data: {
      provider: "quickbooks",
      provider_status: body.provider_status,
      support_report_id: body.support_report_id as number | undefined,
      safe_response_details: body.safe_response_details,
      request_context: body.request_context,
      intuit_tid: intuitTid as string | null,
    },
  };
}

function parseId(value: string | string[]): number {
  return Number.parseInt(Array.isArray(value) ? value[0] : value, 10);
}

function serializeReport(report: typeof supportReportsTable.$inferSelect) {
  return {
    ...report,
    occurred_at: report.occurred_at.toISOString(),
    created_at: report.created_at.toISOString(),
    updated_at: report.updated_at.toISOString(),
  };
}

function serializeEvent(event: typeof supportProviderEventsTable.$inferSelect) {
  return {
    ...event,
    created_at: event.created_at.toISOString(),
  };
}

function shareText(
  report: typeof supportReportsTable.$inferSelect,
  events: typeof supportProviderEventsTable.$inferSelect[],
) {
  const lines = [
    `QuickBooks support report #${report.id}`,
    `Reported: ${report.occurred_at.toISOString()}`,
    `Page: ${report.page_context || "Not provided"}`,
    `Description: ${redactSupportText(report.description)}`,
    `Intuit TID: ${report.intuit_tid || "Not available"}`,
  ];
  if (events.length) {
    lines.push("", "Provider troubleshooting events:");
    for (const event of events) {
      lines.push(
        `- ${event.created_at.toISOString()} | HTTP ${event.provider_status ?? "unknown"} | intuit_tid: ${event.intuit_tid || "Not available"}`,
        `  Response: ${JSON.stringify(sanitizeSupportDetails(event.safe_response_details))}`,
        `  Request: ${JSON.stringify(sanitizeSupportDetails(event.request_context))}`,
      );
    }
  }
  return lines.join("\n");
}

// Member support reports are always scoped to the authenticated Clerk user.
router.get("/support/reports", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const reports = await db.select().from(supportReportsTable)
    .where(eq(supportReportsTable.user_id, userId))
    .orderBy(desc(supportReportsTable.created_at));
  res.json(reports.map(serializeReport));
});

router.post("/support/reports", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const parsed = parseReportInput(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const occurredAt = parsed.data.occurred_at ? new Date(parsed.data.occurred_at) : new Date();
  const [report] = await db.insert(supportReportsTable).values({
    user_id: userId,
    description: parsed.data.description,
    provider: parsed.data.provider,
    page_context: parsed.data.page_context || null,
    intuit_tid: parsed.data.intuit_tid || null,
    occurred_at: occurredAt,
  }).returning();
  req.log?.info({
    event: "support_report_created",
    support_report_id: report.id,
    provider: report.provider,
    page_context: report.page_context,
    intuit_tid: report.intuit_tid,
  }, "Support report created");
  res.status(201).json(serializeReport(report));
});

/**
 * Provider integrations can persist the safe result of a QuickBooks call
 * after inspecting its Response with inspectQuickBooksResponse(). This route
 * is also scoped to the member who owns the optional report.
 */
router.post("/support/provider-events", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const parsed = parseProviderEventInput(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  if (parsed.data.support_report_id) {
    const [report] = await db.select().from(supportReportsTable).where(and(
      eq(supportReportsTable.id, parsed.data.support_report_id),
      eq(supportReportsTable.user_id, userId),
    ));
    if (!report) {
      res.status(404).json({ error: "Support report not found" });
      return;
    }
  }

  const event = inspectQuickBooksResponse(
    {
      status: parsed.data.provider_status,
      headers: { intuit_tid: parsed.data.intuit_tid || undefined },
    },
    parsed.data.safe_response_details,
    parsed.data.request_context,
  );
  const [created] = await db.insert(supportProviderEventsTable).values({
    support_report_id: parsed.data.support_report_id || null,
    user_id: userId,
    provider: event.provider,
    provider_status: event.provider_status,
    safe_response_details: event.safe_response_details,
    request_context: event.request_context,
    intuit_tid: event.intuit_tid,
  }).returning();
  if (event.intuit_tid && parsed.data.support_report_id) {
    await db.update(supportReportsTable)
      .set({ intuit_tid: event.intuit_tid })
      .where(and(
        eq(supportReportsTable.id, parsed.data.support_report_id),
        eq(supportReportsTable.user_id, userId),
      ));
  }
  if (req.log) logQuickBooksResponse(req.log, event);
  res.status(201).json(serializeEvent(created));
});

router.get("/admin/support-reports", authMiddleware, requireAdmin, async (_req, res): Promise<void> => {
  const reports = await db.select().from(supportReportsTable)
    .orderBy(desc(supportReportsTable.created_at))
    .limit(100);
  // Keep the bulk view to operational metadata; private descriptions are
  // available only after an administrator selects one report.
  res.json(reports.map((report) => ({
    id: report.id,
    user_id: report.user_id,
    provider: report.provider,
    page_context: report.page_context,
    intuit_tid: report.intuit_tid,
    occurred_at: report.occurred_at.toISOString(),
    status: report.status,
  })));
});

router.get("/admin/support-reports/:id", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid support report ID" });
    return;
  }
  const [report] = await db.select().from(supportReportsTable)
    .where(eq(supportReportsTable.id, id));
  if (!report) {
    res.status(404).json({ error: "Support report not found" });
    return;
  }
  const events = await db.select().from(supportProviderEventsTable)
    .where(eq(supportProviderEventsTable.support_report_id, report.id))
    .orderBy(desc(supportProviderEventsTable.created_at));
  const serializedEvents = events.map(serializeEvent);
  res.json({
    report: serializeReport(report),
    events: serializedEvents,
    share_text: shareText(report, events),
  });
});

export default router;