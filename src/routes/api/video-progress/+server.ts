import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { videoProgress } from '$lib/server/db/schema';
import { getSessionFromCookie } from '$lib/auth/session';
import { and, eq } from 'drizzle-orm';

const schema = z.object({
    videoId: z.string().uuid(),
    watchedSeconds: z.number().int().min(0),
    completed: z.boolean().optional()
});

export async function POST({ request, cookies, locals }) {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
    }

    const { videoId, watchedSeconds, completed } = parsed.data;

    // Get user session
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

    // Upsert progress
    await db
        .insert(videoProgress)
        .values({
            userId,
            videoId,
            watchedSeconds,
            completed: completed ?? false
        })
        .onConflictDoUpdate({
            target: [videoProgress.userId, videoProgress.videoId],
            set: {
                watchedSeconds,
                completed: completed ?? false,
                lastWatchedAt: new Date()
            }
        });

    return json({ success: true });
}
