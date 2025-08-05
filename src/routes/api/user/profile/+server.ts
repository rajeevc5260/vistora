import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { getSessionFromCookie } from '$lib/auth/session';

const profileSchema = z.object({
    name: z.string().min(1).optional(),
    bio: z.string().optional(),
    website: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional()
});

export async function PUT({ request, cookies, locals }) {
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
        return new Response("Unauthorized", { status: 401 });
    }


    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
        return json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    const updateData = parsed.data;

    if (!session.user.id) {
        return json({ error: 'User ID is missing from session.' }, { status: 400 });
    }

    await db.update(users)
        .set(updateData)
        .where(eq(users.id, session.user.id as string));

    return json({ success: true });
}
