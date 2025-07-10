import { db } from "$lib/server/db";
import { courses, modules, users, videos } from "$lib/server/db/schema";
import { trelae } from "$lib/utils/trelae";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnailFileId: z.string().url().optional(),
});

export async function PUT({ request, params, locals }) {
  const session = await locals.auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid input", { status: 400 });
  }

  const { title, description } = parsed.data;

  await db
    .update(courses)
    .set({ title, description })
    .where(eq(courses.id, params.id));

  return new Response("Updated", { status: 200 });
}


export const DELETE = async ({ params }) => {
  const courseId = params.id;

  try {
    // 1. Fetch course and associated namespaceId
    const [course] = await db
      .select({
        id: courses.id,
        namespaceId: courses.namespaceId,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      return new Response(JSON.stringify({ error: 'not_found', message: 'Course not found' }), { status: 404 });
    }

    // 2. Get all module IDs in the course
    const moduleRows = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.courseId, courseId));

    const moduleIds = moduleRows.map((m) => m.id);

    // 3. Delete all videos under those modules
    if (moduleIds.length > 0) {
      await db.delete(videos).where(inArray(videos.moduleId, moduleIds));
    }

    // 4. Delete modules
    await db.delete(modules).where(eq(modules.courseId, courseId));

    // 5. Delete the course
    await db.delete(courses).where(eq(courses.id, courseId));

    // 6. Delete the Trelae namespace
    if (course.namespaceId) {
      try {
        const namespace = trelae.namespace(course.namespaceId);
        await namespace.delete();
      } catch (err) {
        console.warn(`Warning: Failed to delete Trelae namespace ${course.namespaceId}`, err);
        // continue even if namespace deletion fails
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Failed to delete course:", err);
    return new Response(JSON.stringify({ error: "server_error", message: "Internal error deleting course" }), { status: 500 });
  }
};