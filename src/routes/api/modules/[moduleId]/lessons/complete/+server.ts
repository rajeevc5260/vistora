import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { modules, videos, courses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { randomUUID } from 'crypto';

export async function POST({ request, params }: { request: Request; params: { moduleId: string } }) {
	const moduleId = params.moduleId;
	const { fileId, uploadId, parts, title, duration, description } = await request.json();

	// Get namespaceId via course
	const [moduleRow] = await db.select().from(modules).where(eq(modules.id, moduleId));
	if (!moduleRow) return json({ error: 'Module not found' }, { status: 404 });

	if (!moduleRow.courseId) return json({ error: 'Module missing courseId' }, { status: 400 });

	const [courseRow] = await db
		.select({ namespaceId: courses.namespaceId })
		.from(courses)
		.where(eq(courses.id, moduleRow.courseId));

	if (!courseRow?.namespaceId) return json({ error: 'Missing namespaceId' }, { status: 400 });

	// Complete multipart upload
	const namespace = trelae.namespace(courseRow.namespaceId);
	await namespace.completeMultipartUpload({
		fileId,
		uploadId,
		parts
	});

	// Save to DB
	const [video] = await db
		.insert(videos)
		.values({
			id: randomUUID(),
			moduleId,
			title,
			fileId: fileId,
			description,
			duration: duration
		})
		.returning();

	return json(video);
}
