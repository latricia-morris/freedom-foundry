import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  role: text("role").notNull().default("user"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const userProfilesTable = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  business_name: text("business_name"),
  website: text("website"),
  phone: text("phone"),
  headshot_url: text("headshot_url"),
  account_type: text("account_type").notNull().default("free"),
  brand_power_moves_unlocked: boolean("brand_power_moves_unlocked").notNull().default(false),
  brand_power_moves_unlocked_at: timestamp("brand_power_moves_unlocked_at", { withTimezone: true }),
  unlock_method: text("unlock_method"),
  active_program_id: text("active_program_id"),
  notes: text("notes"),
  setup_status: jsonb("setup_status"),
  marketing_consent: boolean("marketing_consent").notNull().default(false),
  consent_date: timestamp("consent_date", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, created_at: true, updated_at: true });
export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfilesTable.$inferSelect;
