import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	courses,
	users,
	modules,
	videos,
	courseMaterials,
	courseEnrollments,
	favorites,
	videoProgress
} from '$lib/server/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { getSessionFromCookie } from '$lib/auth/session';

export const load: PageServerLoad = async ({ params, cookies, locals }) => {
	const courseId = params.id;

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

	// Fetch course with instructor
	const [rawCourse] = await db
		.select({
			id: courses.id,
			title: courses.title,
			description: courses.description,
			thumbnailFileId: courses.thumbnailFileId,
			createdAt: courses.createdAt,
			instructor: {
				id: users.id,
				name: users.name,
				avatarUrl: users.avatarUrl
			}
		})
		.from(courses)
		.leftJoin(users, eq(courses.instructorId, users.id))
		.where(eq(courses.id, courseId))
		.limit(1);

	if (!rawCourse) {
		throw new Error('Course not found');
	}

	let thumbnailUrl: string | undefined;

	if (rawCourse.thumbnailFileId) {
		try {
			const file = trelae.file(rawCourse.thumbnailFileId);
			thumbnailUrl = await file.getDownloadUrl();
		} catch (error) {
			console.warn(`Error generating thumbnail URL:`, error);
		}
	}

	// Fetch all modules for this course
	const allModules = await db
		.select({
			id: modules.id,
			title: modules.title,
			order: modules.order
		})
		.from(modules)
		.where(eq(modules.courseId, courseId))
		.orderBy(modules.order);

	const moduleIds = allModules.map((m) => m.id);

	// Fetch all videos for these modules
	const allVideos = moduleIds.length
		? await db
			.select({
				id: videos.id,
				title: videos.title,
				description: videos.description,
				moduleId: videos.moduleId,
				duration: videos.duration,
				fileId: videos.fileId
			})
			.from(videos)
			.where(inArray(videos.moduleId, moduleIds))
		: [];

	// Group videos under their modules
	const modulesWithLessons = allModules.map((mod) => ({
		...mod,
		lessons: allVideos.filter((vid) => vid.moduleId === mod.id)
	}));

	// Course materials
	const materials = await db
		.select({
			id: courseMaterials.id,
			name: courseMaterials.name,
			fileId: courseMaterials.fileId,
			fileType: courseMaterials.fileType
		})
		.from(courseMaterials)
		.where(eq(courseMaterials.courseId, courseId));

	const enrichedMaterials = await Promise.all(
		materials.map(async (m) => {
			const url = await trelae.file(m.fileId).getDownloadUrl();
			return { ...m, url };
		})
	);

	// --- Enrollment & Favorites ---
	let isEnrolled = false;
	let isFavorite = false;
	let enrolledCount = 0;
	let progressMap: Record<string, { watchedSeconds: number; completed: boolean }> = {};

	const enrollments = await db
		.select({ userId: courseEnrollments.userId })
		.from(courseEnrollments)
		.where(eq(courseEnrollments.courseId, courseId));

	const enrolledUserIds = enrollments.map((e) => e.userId);
	enrolledCount = enrolledUserIds.length;
	isEnrolled = userId ? enrolledUserIds.includes(userId) : false;

	if (userId) {
		const [favorite] = await db
			.select()
			.from(favorites)
			.where(and(eq(favorites.userId, userId), eq(favorites.courseId, courseId)))
			.limit(1);

		isFavorite = !!favorite;

		// Restrict progress to videos of this course only
		const courseVideoIds = allVideos.map((v) => v.id);
		const progress =
			courseVideoIds.length > 0
				? await db
					.select({
						videoId: videoProgress.videoId,
						watchedSeconds: videoProgress.watchedSeconds,
						completed: videoProgress.completed
					})
					.from(videoProgress)
					.where(
						and(
							eq(videoProgress.userId, userId),
							inArray(videoProgress.videoId, courseVideoIds)
						)
					)
				: [];

		progressMap = Object.fromEntries(
			progress
				.filter((p) => p.watchedSeconds !== null)
				.map((p) => [
					p.videoId,
					{
						watchedSeconds: p.watchedSeconds as number,
						completed: p.completed ?? false
					}
				])
		);
	}

	return {
		course: {
			...rawCourse,
			thumbnailUrl
		},
		modules: modulesWithLessons,
		materials: enrichedMaterials,
		isEnrolled,
		isFavorite,
		enrolledCount,
		progressMap,
		session
	};
};
