import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const personalBrandProfilesTable = pgTable("personal_brand_profiles", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  business_name: text("business_name"),
  headshot_urls: jsonb("headshot_urls"),
  short_bio: text("short_bio"),
  long_bio: text("long_bio"),
  logo_urls: jsonb("logo_urls"),
  feature_links: jsonb("feature_links"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  social_links: jsonb("social_links"),
  location_city: text("location_city"),
  location_state: text("location_state"),
  location_country: text("location_country"),
  has_books: boolean("has_books").notNull().default(false),
  book_links: jsonb("book_links"),
  heading_font: text("heading_font"),
  subheading_font: text("subheading_font"),
  body_font: text("body_font"),
  accent_font: text("accent_font"),
  brand_voice: text("brand_voice"),
  brand_tonality: text("brand_tonality"),
  brand_prompts: text("brand_prompts"),
  brand_specs: text("brand_specs"),
  positioning: text("positioning"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const corporateBrandProfilesTable = pgTable("corporate_brand_profiles", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  company_name: text("company_name"),
  tagline: text("tagline"),
  mission_statement: text("mission_statement"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  location_city: text("location_city"),
  location_state: text("location_state"),
  location_country: text("location_country"),
  has_books: boolean("has_books").notNull().default(false),
  book_links: jsonb("book_links"),
  heading_font: text("heading_font"),
  subheading_font: text("subheading_font"),
  body_font: text("body_font"),
  accent_font: text("accent_font"),
  colors: jsonb("colors"),
  logo_urls: jsonb("logo_urls"),
  moodboard_urls: jsonb("moodboard_urls"),
  brand_voice: text("brand_voice"),
  brand_tonality: text("brand_tonality"),
  brand_personality: text("brand_personality"),
  brand_prompts: text("brand_prompts"),
  brand_specs: text("brand_specs"),
  positioning: text("positioning"),
  target_audience: text("target_audience"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const brandGuidelinesTable = pgTable("brand_guidelines", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  heading_font: text("heading_font"),
  subheading_font: text("subheading_font"),
  body_font: text("body_font"),
  accent_font: text("accent_font"),
  logo_usage_notes: text("logo_usage_notes"),
  color_usage_notes: text("color_usage_notes"),
  typography_notes: text("typography_notes"),
  photography_style: text("photography_style"),
  tone_notes: text("tone_notes"),
  brand_dont_list: text("brand_dont_list"),
  additional_standards: text("additional_standards"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const brandAssetsTable = pgTable("brand_assets", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title"),
  description: text("description"),
  file_url: text("file_url"),
  file_type: text("file_type"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mediaKitsTable = pgTable("media_kits", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  business_name: text("business_name"),
  short_bio: text("short_bio"),
  long_bio: text("long_bio"),
  headshot_urls: jsonb("headshot_urls"),
  logo_urls: jsonb("logo_urls"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  social_links: jsonb("social_links"),
  feature_links: jsonb("feature_links"),
  location_city: text("location_city"),
  location_state: text("location_state"),
  location_country: text("location_country"),
  has_books: boolean("has_books").notNull().default(false),
  book_links: jsonb("book_links"),
  podcast_links: jsonb("podcast_links"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bigPicturesTable = pgTable("big_pictures", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  word_for_the_year: text("word_for_the_year"),
  end_of_year_goal: text("end_of_year_goal"),
  secondary_goal: text("secondary_goal"),
  annual_revenue: text("annual_revenue"),
  monthly_revenue: text("monthly_revenue"),
  weekly_revenue: text("weekly_revenue"),
  pricing_strategy_month: text("pricing_strategy_month"),
  client_booking_target: text("client_booking_target"),
  clients_per_week: text("clients_per_week"),
  travel_goals: text("travel_goals"),
  learning_goals: text("learning_goals"),
  meeting_goals: text("meeting_goals"),
  impact_statement: text("impact_statement"),
  legacy_statement: text("legacy_statement"),
  planning_checklist: jsonb("planning_checklist"),
  vision_health: text("vision_health"),
  vision_career: text("vision_career"),
  vision_family: text("vision_family"),
  vision_money: text("vision_money"),
  vision_travels: text("vision_travels"),
  vision_hobbies: text("vision_hobbies"),
  vision_relationships: text("vision_relationships"),
  breakdown_goal: text("breakdown_goal"),
  breakdown_components: text("breakdown_components"),
  breakdown_priorities: text("breakdown_priorities"),
  breakdown_monthly_target: text("breakdown_monthly_target"),
  breakdown_weekly_tasks: text("breakdown_weekly_tasks"),
  breakdown_daily_step: text("breakdown_daily_step"),
  breakdown_weekly_review: text("breakdown_weekly_review"),
  long_term_goal_3yr: text("long_term_goal_3yr"),
  long_term_goal_5yr: text("long_term_goal_5yr"),
  long_term_revenue: text("long_term_revenue"),
  long_term_positioning: text("long_term_positioning"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const igniteOSTable = pgTable("ignite_os", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  data: jsonb("data"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const shareLinksTable = pgTable("share_links", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  profile_type: text("profile_type").notNull(),
  profile_id: text("profile_id"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPersonalBrandProfileSchema = createInsertSchema(personalBrandProfilesTable).omit({ id: true, created_at: true, updated_at: true });
export const insertCorporateBrandProfileSchema = createInsertSchema(corporateBrandProfilesTable).omit({ id: true, created_at: true, updated_at: true });
export const insertBrandGuidelinesSchema = createInsertSchema(brandGuidelinesTable).omit({ id: true, created_at: true, updated_at: true });
export const insertBrandAssetSchema = createInsertSchema(brandAssetsTable).omit({ id: true, created_at: true, updated_at: true });
export const insertMediaKitSchema = createInsertSchema(mediaKitsTable).omit({ id: true, created_at: true, updated_at: true });
export const insertBigPictureSchema = createInsertSchema(bigPicturesTable).omit({ id: true, created_at: true, updated_at: true });
export const insertIgniteOSSchema = createInsertSchema(igniteOSTable).omit({ id: true, created_at: true, updated_at: true });
export const insertShareLinkSchema = createInsertSchema(shareLinksTable).omit({ id: true, created_at: true });

export type PersonalBrandProfile = typeof personalBrandProfilesTable.$inferSelect;
export type CorporateBrandProfile = typeof corporateBrandProfilesTable.$inferSelect;
export type BrandGuidelines = typeof brandGuidelinesTable.$inferSelect;
export type BrandAsset = typeof brandAssetsTable.$inferSelect;
export type MediaKit = typeof mediaKitsTable.$inferSelect;
export type BigPicture = typeof bigPicturesTable.$inferSelect;
export type IgniteOS = typeof igniteOSTable.$inferSelect;
export type ShareLink = typeof shareLinksTable.$inferSelect;
