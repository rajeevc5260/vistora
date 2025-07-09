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
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  instructorId: uuid("instructor_id").references(() => users.id),
  namespaceId: text("namespace_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
},
  (table) => [
    uniqueIndex("unique_course_namespace").on(table.id, table.namespaceId),
  ]
);

// Modules
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id),
  title: text("title"),
  order: integer("order"),
});

// Videos
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").references(() => modules.id),
  title: text("title"),
  description: text("description"),
  folderId: text("folder_id"),
  resolutions: text("resolutions"), // e.g. "360p,720p,1080p"
  duration: integer("duration"), // in seconds
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

