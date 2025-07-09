import { db } from "$lib/server/db";
import { courses, users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { json } from "@sveltejs/kit";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

export async function PUT({ request, params, locals }) {
  const session = await locals.auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid input", { status: 400 });
  }

  const { title, description, thumbnailUrl } = parsed.data;

  await db
    .update(courses)
    .set({ title, description, thumbnailUrl })
    .where(eq(courses.id, params.id));

  return new Response("Updated", { status: 200 });
}

export async function GET({ params }) {
	const courseId = params.id;

	const [course] = await db
		.select({
			id: courses.id,
			title: courses.title,
			description: courses.description,
			thumbnailUrl: courses.thumbnailUrl,
			createdAt: courses.createdAt,
			instructor: {
				id: users.id,
				name: users.name,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(courses)
		.leftJoin(users, eq(courses.instructorId, users.id))
		.where(eq(courses.id, courseId))
		.limit(1);

	if (!course) {
		return json({ error: "Course not found" }, { status: 404 });
	}

	return json(course);
}
