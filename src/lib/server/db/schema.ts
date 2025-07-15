import { sql } from "drizzle-orm";
import { uuid, boolean, pgTable, text, timestamp, integer, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("viewer"), // 'admin', 'instructor', 'viewer'
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailFileId: text("thumbnail_file_id"),
  instructorId: uuid("instructor_id").references(() => users.id),
  namespaceId: text("namespace_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
},
  (table) => [
    uniqueIndex("unique_course_namespace").on(table.id, table.namespaceId),
  ]
);

export const courseThumbnails = pgTable('course_thumbnails', {
	id: uuid('id').primaryKey().defaultRandom(),
  name:text('name'),
	courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
	fileId: text('file_id').notNull(),
	location: text('location'),
	createdAt: timestamp('created_at').defaultNow()
});

// Modules
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id),
  title: text("title"),
  order: integer("order"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").references(() => modules.id),
  title: text("title"),
  description: text("description"),
  fileId: text("file_id"),
  resolutions: text("resolutions"), // e.g. "360p,720p,1080p"
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseMaterials = pgTable("course_materials", {
	id: uuid("id").primaryKey().defaultRandom(),
	courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
	name: text("name").notNull(),
	fileId: text("file_id").notNull(),
	fileType: text("file_type"), // "pdf", "zip", "image", etc.
	location: text("location"), // Trelae storage location if needed
	createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type NewCourseMaterial = typeof courseMaterials.$inferInsert;

