import { json } from '@sveltejs/kit';
import { trelae } from '$lib/utils/trelae';
import { courses } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '$lib/auth/session';

export async function POST({ request, params, locals, cookies }) {
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
    const { name } = await request.json();

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) {
        return json({ error: 'Course not found' }, { status: 404 });
    }

    const uploadRequest = await trelae
        .namespace(course.namespaceId)
        .getUploadUrl({
            name,
            location: 'thumbnail'
        });

    return json({
        uploadUrl: uploadRequest.uploadUrl,
        id: uploadRequest.id
    });
}
