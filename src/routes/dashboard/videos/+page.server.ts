import { db } from '$lib/server/db';
import { videos, modules, courses, courseThumbnails } from '$lib/server/db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { trelae } from '$lib/utils/trelae';
import type { PageServerLoad } from './$types';
import { getSessionFromCookie } from '$lib/auth/session';

export const load: PageServerLoad = async ({ locals, cookies }) => {
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

	console.log("session", session)

	if (!session?.user) {
		throw redirect(302, '/auth/signin');
	}

	try {
		// Get initial videos
		const rawVideos = await db
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
			.limit(20);

		// Get thumbnail URLs in parallel
		const initialVideos = await Promise.all(
			rawVideos.map(async (video) => {
				let thumbnailUrl: string | null = null;
				if (video.courseThumbnailFileId) {
					try {
						thumbnailUrl = await trelae.file(video.courseThumbnailFileId).getDownloadUrl();
					} catch (e) {
						console.error('Failed to get thumbnail URL:', e);
					}
				}
				return {
					...video,
					thumbnailUrl
				};
			})
		);

		const totalVideosResult = await db
			.select({ count: count() })
			.from(videos)
			.leftJoin(modules, eq(videos.moduleId, modules.id))
			.leftJoin(courses, eq(modules.courseId, courses.id))
			.where(
                session.user.id
                    ? eq(courses.instructorId, session.user.id)
                    : sql`1=0`
            )

		const totalVideos = totalVideosResult[0]?.count || 0;

		return {
			initialVideos,
			totalVideos,
			session
		};
	} catch (error) {
		console.error('Error loading videos:', error);
		return {
			initialVideos: [],
			totalVideos: 0,
			session
		};
	}
};
