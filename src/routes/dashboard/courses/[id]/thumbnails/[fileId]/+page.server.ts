import { db } from '$lib/server/db';
import { courseThumbnails, courses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const courseId = params.id;
	const fileId = params.fileId;

	const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
	if (!course) throw error(404, 'Course not found');

	const [thumbnail] = await db
		.select()
		.from(courseThumbnails)
		.where(eq(courseThumbnails.fileId, fileId));

	if (!thumbnail) throw error(404, 'Thumbnail not found');

	const url = await trelae.file(fileId).getDownloadUrl();

	return {
		course,
		thumbnail: {
			...thumbnail,
			url
		}
	};
}
