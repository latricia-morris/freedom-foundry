import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referralPartnersTable = pgTable("referral_partners", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  clerk_user_id: text("clerk_user_id"),
  name: text("name"),
  status: text("status").notNull().default("invited"),
  referral_only: boolean("referral_only").notNull().default(true),
  internal_notes: text("internal_notes"),
  invitation_id: text("invitation_id"),
  invitation_status: text("invitation_status").notNull().default("pending"),
  invitation_error: text("invitation_error"),
  invited_at: timestamp("invited_at", { withTimezone: true }),
  activated_at: timestamp("activated_at", { withTimezone: true }),
  revoked_at: timestamp("revoked_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const referralSubmissionsTable = pgTable("referral_submissions", {
  id: serial("id").primaryKey(),
  partner_id: integer("partner_id").notNull().references(() => referralPartnersTable.id),
  kind: text("kind").notNull().default("referral"),
  contact_name: text("contact_name"),
  contact_email: text("contact_email"),
  contact_phone: text("contact_phone"),
  business_name: text("business_name"),
  relationship: text("relationship"),
  notes: text("notes"),
  question: text("question"),
  status: text("status").notNull().default("submitted"),
  payout_status: text("payout_status").notNull().default("pending"),
  internal_notes: text("internal_notes"),
  notification_status: text("notification_status").notNull().default("pending"),
  confirmation_status: text("confirmation_status").notNull().default("pending"),
  email_error: text("email_error"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReferralPartnerSchema = createInsertSchema(referralPartnersTable)
  .omit({ id: true, created_at: true, updated_at: true });
export const insertReferralSubmissionSchema = createInsertSchema(referralSubmissionsTable)
  .omit({ id: true, created_at: true, updated_at: true });
export type InsertReferralPartner = z.infer<typeof insertReferralPartnerSchema>;
export type ReferralPartner = typeof referralPartnersTable.$inferSelect;
export type InsertReferralSubmission = z.infer<typeof insertReferralSubmissionSchema>;
export type ReferralSubmission = typeof referralSubmissionsTable.$inferSelect;