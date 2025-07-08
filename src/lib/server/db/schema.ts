import { sql } from "drizzle-orm";
import { uuid, boolean, pgTable, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  namespaceId: text("namespace_id").notNull(),
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
  namespaceId: text("namespace_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Video Progress
export const videoProgress = pgTable("video_progress", {
  userId: uuid("user_id").references(() => users.id),
  videoId: uuid("video_id").references(() => videos.id),
  watchedUntil: integer("watched_until"), // in seconds
  completed: boolean("completed").default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.videoId] }), // Composite PK
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoProgress = typeof videoProgress.$inferSelect;
export type NewVideoProgress = typeof videoProgress.$inferInsert;

