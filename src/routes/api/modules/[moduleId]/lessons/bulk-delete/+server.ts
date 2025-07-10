import { db } from '$lib/server/db';
import { videos } from '$lib/server/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { json } from '@sveltejs/kit';

export const POST = async ({ params, request }) => {
	const moduleId = params.moduleId;
	const { fileIds } = await request.json();

	if (!Array.isArray(fileIds) || fileIds.length === 0) {
		return json({ error: 'Invalid fileIds' }, { status: 400 });
	}

	// Delete files from Trelae (securely)
	try {
		const files = trelae.files(fileIds);
		await files.delete();
	} catch (err) {
		console.error("Trelae delete error:", err);
		return json({ error: 'trelae-delete-failed' }, { status: 500 });
	}

	// Delete lessons from DB
	await db.delete(videos).where(
		and(eq(videos.moduleId, moduleId), inArray(videos.fileId, fileIds))
	);

	return json({ success: true });
};
