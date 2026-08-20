import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Administrator-only staging area for a client portal before the client has a
 * Clerk account. The JSON payload is promoted to the existing member-scoped
 * tables only after the setup is claimed by the matching email address.
 */
export const clientSetupsTable = pgTable("client_setups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  business_name: text("business_name"),
  notes: text("notes"),
  status: text("status").notNull().default("draft"),
  payload: jsonb("payload").notNull().default({}),
  claimed_user_id: text("claimed_user_id"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/**
 * Reusable agency-owned starter content. Templates intentionally contain only
 * generic material such as checklists and guidelines, never client identity.
 */
export const clientSetupTemplatesTable = pgTable("client_setup_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  payload: jsonb("payload").notNull().default({}),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertClientSetupSchema = createInsertSchema(clientSetupsTable).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const insertClientSetupTemplateSchema = createInsertSchema(clientSetupTemplatesTable).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type ClientSetup = typeof clientSetupsTable.$inferSelect;
export type ClientSetupTemplate = typeof clientSetupTemplatesTable.$inferSelect;
export type InsertClientSetup = z.infer<typeof insertClientSetupSchema>;
export type InsertClientSetupTemplate = z.infer<typeof insertClientSetupTemplateSchema>;