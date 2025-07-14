import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { json } from '@sveltejs/kit';

export async function POST({ params, request }) {
	const courseId = params.id;
	const { name, type } = await request.json();

	const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
	if (!course) return json({ error: 'Course not found' }, { status: 404 });

	const namespace = trelae.namespace(course.namespaceId);
	const { id, uploadUrl } = await namespace.getUploadUrl({
		name,
		location: 'materials'
	});

	return json({ fileId: id, uploadUrl, location: 'materials', namespaceId: course.namespaceId });
}
