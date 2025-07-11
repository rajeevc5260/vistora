import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courseThumbnails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';

export async function DELETE({ params, locals }) {
    const session = await locals.auth();
    if (!session || !session.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const courseId = params.id;
    const fileId = params.fileId;

    try {
        // Delete from Trelae storage
        await trelae.file(fileId).delete();

        // Delete from DB
        await db.delete(courseThumbnails).where(eq(courseThumbnails.fileId, fileId));

        return json({ success: true });
    } catch (err) {
        console.error('Failed to delete thumbnail:', err);
        return json({ error: 'Thumbnail deletion failed' }, { status: 500 });
    }
}
