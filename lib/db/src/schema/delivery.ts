import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Payment eligibility is deliberately independent from client approvals. It is
 * set by an agency administrator after manual verification, until a payment
 * provider is intentionally integrated.
 */
export const deliveryPaymentEligibilityTable = pgTable("delivery_payment_eligibility", {
  id: serial("id").primaryKey(),
  corporate_profile_id: integer("corporate_profile_id").notNull().unique(),
  confirmed_paid_in_full: boolean("confirmed_paid_in_full").notNull().default(false),
  confirmed_at: timestamp("confirmed_at", { withTimezone: true }),
  confirmed_by_user_id: text("confirmed_by_user_id"),
  evidence: text("evidence"),
  reason: text("reason"),
  generation: integer("generation").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/**
 * A visibility row is always bound to the Drive modifiedTime that an agency
 * administrator reviewed. A Drive edit makes the old decision stale by design.
 */
export const driveFileVisibilityTable = pgTable("drive_file_visibility", {
  id: serial("id").primaryKey(),
  corporate_profile_id: integer("corporate_profile_id").notNull(),
  drive_file_id: text("drive_file_id").notNull(),
  visibility: text("visibility").notNull().default("hidden"),
  drive_modified_time: text("drive_modified_time").notNull(),
  released_with_override: boolean("released_with_override").notNull().default(false),
  set_by_user_id: text("set_by_user_id").notNull(),
  reason: text("reason"),
  generation: integer("generation").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("drive_file_visibility_profile_file_unique").on(table.corporate_profile_id, table.drive_file_id),
]);

export const driveFileCommentsTable = pgTable("drive_file_comments", {
  id: serial("id").primaryKey(),
  corporate_profile_id: integer("corporate_profile_id").notNull(),
  drive_file_id: text("drive_file_id").notNull(),
  drive_modified_time: text("drive_modified_time").notNull(),
  author_user_id: text("author_user_id").notNull(),
  author_email: text("author_email"),
  body: text("body").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const driveFileDecisionsTable = pgTable("drive_file_decisions", {
  id: serial("id").primaryKey(),
  corporate_profile_id: integer("corporate_profile_id").notNull(),
  drive_file_id: text("drive_file_id").notNull(),
  drive_modified_time: text("drive_modified_time").notNull(),
  decision: text("decision").notNull(),
  note: text("note"),
  decided_by_user_id: text("decided_by_user_id").notNull(),
  decided_by_email: text("decided_by_email"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Immutable operational history. The payload is limited to internal action
 * context, never Drive URLs or file bytes.
 */
export const deliveryAuditLogTable = pgTable("delivery_audit_log", {
  id: serial("id").primaryKey(),
  corporate_profile_id: integer("corporate_profile_id").notNull(),
  action: text("action").notNull(),
  actor_user_id: text("actor_user_id").notNull(),
  actor_role: text("actor_role").notNull(),
  drive_file_id: text("drive_file_id"),
  drive_modified_time: text("drive_modified_time"),
  details: jsonb("details").notNull().default({}),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeliveryPaymentEligibilitySchema = createInsertSchema(deliveryPaymentEligibilityTable)
  .omit({ id: true, created_at: true, updated_at: true });
export const insertDriveFileVisibilitySchema = createInsertSchema(driveFileVisibilityTable)
  .omit({ id: true, created_at: true, updated_at: true });
export const insertDriveFileCommentSchema = createInsertSchema(driveFileCommentsTable)
  .omit({ id: true, created_at: true });
export const insertDriveFileDecisionSchema = createInsertSchema(driveFileDecisionsTable)
  .omit({ id: true, created_at: true });
export const insertDeliveryAuditLogSchema = createInsertSchema(deliveryAuditLogTable)
  .omit({ id: true, created_at: true });

export type DeliveryPaymentEligibility = z.infer<typeof insertDeliveryPaymentEligibilitySchema>;
export type DriveFileVisibility = typeof driveFileVisibilityTable.$inferSelect;
export type DriveFileComment = typeof driveFileCommentsTable.$inferSelect;
export type DriveFileDecision = typeof driveFileDecisionsTable.$inferSelect;
export type DeliveryAuditLog = typeof deliveryAuditLogTable.$inferSelect;