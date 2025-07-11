import { db } from '$lib/server/db';
import { modules, videos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { json } from '@sveltejs/kit';

export const DELETE = async ({ params }) => {
    const moduleId = params.moduleId;

    // 1. Fetch all videos belonging to this module
    const moduleVideos = await db.select().from(videos).where(eq(videos.moduleId, moduleId));

    const fileIds = moduleVideos
        .map((v) => v.fileId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);

    // 2. Delete files from Trelae
    if (fileIds.length > 0) {
        try {
            const files = trelae.files(fileIds);
            await files.delete();
        } catch (err) {
            console.error('Trelae delete error:', err);
            return json({ error: 'trelae-delete-failed' }, { status: 500 });
        }

        // 3. Delete video records from DB
        await db.delete(videos).where(eq(videos.moduleId, moduleId));
    }

    // 4. Delete module record
    await db.delete(modules).where(eq(modules.id, moduleId));

    return json({ success: true });
};
