import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { modules, courses, videos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { randomUUID } from 'crypto';

export async function POST({ request, params }) {
	const moduleId = params.moduleId;
	const form = await request.formData();

	const title = form.get('title')?.toString();
	const file = form.get('file') as File | null;

	if (!title || !file) {
		return json({ error: 'Missing title or file' }, { status: 400 });
	}

	// Get module and course
	const [moduleRow] = await db.select().from(modules).where(eq(modules.id, moduleId));
	if (!moduleRow) return json({ error: 'Module not found' }, { status: 404 });

	if (!moduleRow.courseId) return json({ error: 'Module is missing courseId' }, { status: 400 });

	const [courseRow] = await db
		.select({ namespaceId: courses.namespaceId })
		.from(courses)
		.where(eq(courses.id, moduleRow.courseId));

	if (!courseRow?.namespaceId) return json({ error: 'Missing namespaceId' }, { status: 400 });

	// Start multipart upload
	const namespace = trelae.namespace(courseRow.namespaceId);
	const { id: fileId, uploadId, partSize, partCount, urls } = await namespace.startMultipartUpload({
		name: file.name,
		location: `${moduleRow.title}`,
		size: file.size
	});

	// Return upload instructions to client
	return json({
		fileId,
		uploadId,
		partSize,
		partCount,
		partUrls: urls,
		fileName: file.name,
		title
	});
}
