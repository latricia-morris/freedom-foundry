import { pgTable, text, serial, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vaultItemsTable = pgTable("vault_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  type: text("type").notNull().default("Course"),
  featured_image_url: text("featured_image_url"),
  download_url: text("download_url"),
  tags: jsonb("tags"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("draft"),
  order: integer("order").notNull().default(0),
  is_featured: boolean("is_featured").notNull().default(false),
  is_free: boolean("is_free").notNull().default(true),
  access_code: text("access_code"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const courseModulesTable = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  vault_item_id: integer("vault_item_id"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const courseLessonsTable = pgTable("course_lessons", {
  id: serial("id").primaryKey(),
  module_id: integer("module_id"),
  title: text("title").notNull(),
  content: text("content"),
  video_url: text("video_url"),
  status: text("status").notNull().default("draft"),
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const lessonProgressTable = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  lesson_id: integer("lesson_id").notNull(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workbookDefinitionsTable = pgTable("workbook_definitions", {
  id: serial("id").primaryKey(),
  vault_item_id: integer("vault_item_id"),
  title: text("title").notNull(),
  description: text("description"),
  fields: jsonb("fields"),
  status: text("status").notNull().default("draft"),
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const workbookResponsesTable = pgTable("workbook_responses", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  workbook_id: integer("workbook_id").notNull(),
  responses: jsonb("responses"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const checklistTasksTable = pgTable("checklist_tasks", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"),
  parent_id: integer("parent_id"),
  deadline_date: text("deadline_date"),
  assignee: text("assignee"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const brandUpPromptsTable = pgTable("brand_up_prompts", {
  id: serial("id").primaryKey(),
  title: text("title"),
  prompt: text("prompt"),
  is_active: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const brandUpEntriesTable = pgTable("brand_up_entries", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  prompt_id: integer("prompt_id"),
  response: text("response"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const serviceRequestSubmissionsTable = pgTable("service_request_submissions", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  service_type: text("service_type").notNull(),
  details: jsonb("details"),
  budget_range: text("budget_range"),
  timeline: text("timeline"),
  deposit_acknowledged: boolean("deposit_acknowledged").notNull().default(false),
  status: text("status").notNull().default("submitted"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVaultItemSchema = createInsertSchema(vaultItemsTable).omit({ id: true, created_at: true, updated_at: true });
export const insertCourseModuleSchema = createInsertSchema(courseModulesTable).omit({ id: true, created_at: true, updated_at: true });
export const insertCourseLessonSchema = createInsertSchema(courseLessonsTable).omit({ id: true, created_at: true, updated_at: true });
export const insertLessonProgressSchema = createInsertSchema(lessonProgressTable).omit({ id: true, created_at: true });
export const insertWorkbookDefinitionSchema = createInsertSchema(workbookDefinitionsTable).omit({ id: true, created_at: true, updated_at: true });
export const insertWorkbookResponseSchema = createInsertSchema(workbookResponsesTable).omit({ id: true, created_at: true, updated_at: true });
export const insertChecklistTaskSchema = createInsertSchema(checklistTasksTable).omit({ id: true, created_at: true, updated_at: true });
export const insertBrandUpPromptSchema = createInsertSchema(brandUpPromptsTable).omit({ id: true, created_at: true, updated_at: true });
export const insertBrandUpEntrySchema = createInsertSchema(brandUpEntriesTable).omit({ id: true, created_at: true, updated_at: true });
export const insertServiceRequestSchema = createInsertSchema(serviceRequestSubmissionsTable).omit({ id: true, created_at: true, updated_at: true });

export type VaultItem = typeof vaultItemsTable.$inferSelect;
export type CourseModule = typeof courseModulesTable.$inferSelect;
export type CourseLesson = typeof courseLessonsTable.$inferSelect;
export type LessonProgress = typeof lessonProgressTable.$inferSelect;
export type WorkbookDefinition = typeof workbookDefinitionsTable.$inferSelect;
export type WorkbookResponse = typeof workbookResponsesTable.$inferSelect;
export type ChecklistTask = typeof checklistTasksTable.$inferSelect;
export type BrandUpPrompt = typeof brandUpPromptsTable.$inferSelect;
export type BrandUpEntry = typeof brandUpEntriesTable.$inferSelect;
export type ServiceRequestSubmission = typeof serviceRequestSubmissionsTable.$inferSelect;
