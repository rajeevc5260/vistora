import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { videos, modules, courses, courseThumbnails } from '$lib/server/db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { trelae } from '$lib/utils/trelae';
import { getSessionFromCookie } from '$lib/auth/session';

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
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


    if (!session?.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const searchQuery = url.searchParams.get('query') || '';

    try {
        const filters = [
            eq(courses.instructorId, session.user.id!)
        ];

        const search = searchQuery.trim()
            ? or(
                like(videos.title, `%${searchQuery}%`),
                like(videos.description, `%${searchQuery}%`),
                like(courses.title, `%${searchQuery}%`)
            )
            : null;

        if (search) filters.push(search);

        let baseQuery = db
            .select({
                id: videos.id,
                title: videos.title,
                description: videos.description,
                fileId: videos.fileId,
                resolutions: videos.resolutions,
                duration: videos.duration,
                createdAt: videos.createdAt,
                moduleTitle: modules.title,
                courseTitle: courses.title,
                courseId: courses.id,
                moduleId: videos.moduleId,
                courseThumbnailFileId: courseThumbnails.fileId
            })
            .from(videos)
            .leftJoin(modules, eq(videos.moduleId, modules.id))
            .leftJoin(courses, eq(modules.courseId, courses.id))
            .leftJoin(courseThumbnails, eq(courses.id, courseThumbnails.courseId))
            .where(and(...filters))
            .orderBy(desc(videos.createdAt))
            .limit(limit)
            .offset(offset);

        const rawVideos = await baseQuery;

        // Fetch presigned URLs in parallel
        const videosWithThumbnails = await Promise.all(
            rawVideos.map(async (video) => {
                let thumbnailUrl: string | null = null;
                if (video.courseThumbnailFileId) {
                    try {
                        thumbnailUrl = await trelae
                            .file(video.courseThumbnailFileId)
                            .getDownloadUrl({ expire: 2400 });
                    } catch (err) {
                        console.error(`Failed to fetch thumbnail for ${video.courseThumbnailFileId}`, err);
                    }
                }
                return {
                    ...video,
                    thumbnailUrl
                };
            })
        );

        return json(videosWithThumbnails);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
