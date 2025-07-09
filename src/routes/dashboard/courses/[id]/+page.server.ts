import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { courses, users, modules, videos } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';

export const load: PageServerLoad = async ({ params }) => {
	const courseId = params.id;

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
				avatarUrl: users.avatarUrl,
			},
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
			thumbnailUrl = await file.getDownloadUrl({ expire: 600 });
		} catch (error) {
			console.warn(`Error generating thumbnail URL:`, error);
		}
	}

	// Fetch all modules
	const allModules = await db
		.select({
			id: modules.id,
			title: modules.title,
			order: modules.order,
		})
		.from(modules)
		.where(eq(modules.courseId, courseId))
		.orderBy(modules.order);

	// Fetch all videos for the course's modules
	const moduleIds = allModules.map((m) => m.id);
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

	// Group videos under corresponding module as `lessons`
	const modulesWithLessons = allModules.map((mod) => ({
		...mod,
		lessons: allVideos.filter((vid) => vid.moduleId === mod.id),
	}));

	return {
		course: {
			...rawCourse,
			thumbnailUrl,
		},
		modules: modulesWithLessons,
	};
};
