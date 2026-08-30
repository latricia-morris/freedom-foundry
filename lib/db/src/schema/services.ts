import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const serviceHubConfigTable = pgTable("service_hub_config", {
  id: serial("id").primaryKey(),
  categories: jsonb("categories").notNull().default([]),
  notification_recipient: text("notification_recipient").notNull().default("latricia@thebrandrevivalist.com"),
  notification_templates: jsonb("notification_templates").notNull().default({}),
  update_threshold_months: integer("update_threshold_months").notNull().default(12),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServiceHubConfigSchema = createInsertSchema(serviceHubConfigTable).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type ServiceHubConfig = typeof serviceHubConfigTable.$inferSelect;