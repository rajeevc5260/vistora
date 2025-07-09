import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courses, modules } from '$lib/server/db/schema';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const bodySchema = z.object({
  title: z.string().min(1),
  order: z.number().int().optional().default(0),
});

export async function POST({ request, params }) {
  const courseId = params.id;
  const body = await request.json();
  const { title, order } = bodySchema.parse(body);

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  if (!course) return json({ error: 'Course not found' }, { status: 404 });

  const id = randomUUID();

  const [module] = await db
    .insert(modules)
    .values({
      id,
      courseId,
      title,
      order: sql`COALESCE((SELECT MAX("order") FROM ${modules} WHERE ${modules.courseId} = ${courseId}), 0) + 1`,
    })
    .returning();

  return json(module);
}
