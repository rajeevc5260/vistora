import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courseEnrollments } from '$lib/server/db/schema';
import { getSessionFromCookie } from '$lib/auth/session';

export async function POST({ request, locals, cookies }) {
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

    console.log("Session:", session);
    console.log("Session user:", session?.user);
    if (!session?.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (typeof courseId !== 'string' || !courseId) {
        return json({ error: "Missing or invalid courseId" }, { status: 400 });
    }

    await db.insert(courseEnrollments).values({
        courseId: courseId,
        userId: session.user.id as string,
    }).onConflictDoNothing();

    return json({ success: true });
}
