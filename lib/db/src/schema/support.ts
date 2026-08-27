import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const supportReportsTable = pgTable("support_reports", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  description: text("description").notNull(),
  provider: text("provider").notNull().default("quickbooks"),
  page_context: text("page_context"),
  intuit_tid: text("intuit_tid"),
  occurred_at: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("open"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const supportProviderEventsTable = pgTable("support_provider_events", {
  id: serial("id").primaryKey(),
  support_report_id: integer("support_report_id"),
  user_id: text("user_id").notNull(),
  provider: text("provider").notNull().default("quickbooks"),
  provider_status: integer("provider_status"),
  safe_response_details: jsonb("safe_response_details"),
  request_context: jsonb("request_context"),
  intuit_tid: text("intuit_tid"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSupportReportSchema = createInsertSchema(supportReportsTable).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSupportProviderEventSchema = createInsertSchema(supportProviderEventsTable).omit({
  id: true,
  created_at: true,
});

export type SupportReport = typeof supportReportsTable.$inferSelect;
export type SupportProviderEvent = typeof supportProviderEventsTable.$inferSelect;