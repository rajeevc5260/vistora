import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { getSessionFromCookie } from '$lib/auth/session';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
    const authCookie = cookies.get('auth');
    let session = null;

    // Try to get session from cookie
    if (authCookie) {
        const decoded = await getSessionFromCookie(authCookie);
        if (decoded) session = { user: decoded };
    }

    // Fallback to locals.auth (Google session)
    if (!session && locals.auth) {
        const googleSession = await locals.auth();
        if (googleSession) session = googleSession;
    }

    if (!session || !session.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Fetch latest profile from DB
    const [user] = await db
        .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        website: users.website,
        phone: users.phone,
        location: users.location
        })
        .from(users)
        .where(eq(users.id, userId!));

    if (!user) {
        return new Response('User not found', { status: 404 });
    }

    return {
        user 
    };
};
