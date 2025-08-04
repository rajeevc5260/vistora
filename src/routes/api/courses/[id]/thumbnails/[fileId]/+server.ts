import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courseThumbnails } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { getSessionFromCookie } from '$lib/auth/session';

export async function DELETE({ params, locals, cookies }) {
    const authCookie = cookies.get('auth');
	let session = null;

	if (authCookie) {
		const decoded = await getSessionFromCookie(authCookie);
		if (decoded) session = { user: decoded };
	}

	if (!session && locals.auth) {
		const googleSession = await locals.auth();
		if (googleSession) session = googleSession;
	}

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
