import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { videos, modules, courses, courseThumbnails } from '$lib/server/db/schema';
import { eq, desc, like, or, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { trelae } from '$lib/utils/trelae';

export const GET: RequestHandler = async ({ url, locals }) => {
    const session = await locals.auth();

    if (!session?.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const searchQuery = url.searchParams.get('query') || '';

    try {
        // Base query
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
            .where(
                session.user.id
                    ? eq(courses.instructorId, session.user.id)
                    : sql`1=0`
            )
            .orderBy(desc(videos.createdAt))
            .limit(limit)
            .offset(offset);

        // Add search filter if present
        if (searchQuery.trim()) {
            // @ts-expect-error
            baseQuery = baseQuery.where(
                or(
                    like(videos.title, `%${searchQuery}%`),
                    like(videos.description, `%${searchQuery}%`),
                    like(courses.title, `%${searchQuery}%`)
                )
            );
        }

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
