import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { favorites } from '$lib/server/db/schema';
import { getSessionFromCookie } from '$lib/auth/session';
import { eq, and } from 'drizzle-orm';

export async function POST({ request, cookies, locals }) {
    const { courseId, action } = await request.json();
    if (!courseId || !['favorite', 'unfavorite'].includes(action)) {
        return json({ error: 'Invalid input' }, { status: 400 });
    }

    let session = null;
    const authCookie = cookies.get('auth');
    if (authCookie) {
        const decoded = await getSessionFromCookie(authCookie);
        if (decoded) session = { user: decoded };
    }
    if (!session && locals.auth) {
        const googleSession = await locals.auth();
        if (googleSession) session = googleSession;
    }
    const userId = session?.user?.id;
    if (!userId) return new Response("Unauthorized", { status: 401 });

    if (action === 'favorite') {
        await db.insert(favorites).values({ courseId, userId }).onConflictDoNothing();
    } else {
        await db.delete(favorites)
    .where(and(
        eq(favorites.courseId, courseId),
        eq(favorites.userId, userId)
    ));
    }

    return json({ success: true });
}
