// src/routes/api/courses/[id]/materials/save.ts
import { db } from '$lib/server/db';
import { courseMaterials } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';

export async function POST({ params, request }) {
	const courseId = params.id;
	const { fileId, name, type, location } = await request.json();

	if (!fileId || !name || !type) {
		return json({ error: 'Missing fields' }, { status: 400 });
	}

	await db.insert(courseMaterials).values({
		courseId,
		fileId,
		name,
		fileType: type,
		location,
	});

	return json({ success: true });
}
