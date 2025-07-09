import { db } from "$lib/server/db";
import { courses, users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
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