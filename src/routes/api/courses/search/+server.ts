import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { trelae } from '$lib/utils/trelae';
import { and, ilike, eq } from 'drizzle-orm';
import { getSessionFromCookie } from '$lib/auth/session';

const searchSchema = z.object({
	query: z.string().min(1),
	limit: z.coerce.number().min(1).max(50).default(10),
	offset: z.coerce.number().min(0).default(0)
});

export async function GET({ url, cookies, locals }) {
	const result = searchSchema.safeParse({
		query: url.searchParams.get('query'),
		limit: url.searchParams.get('limit'),
		offset: url.searchParams.get('offset')
	});

	if (!result.success) {
		return json({ error: 'Invalid search parameters' }, { status: 400 });
	}

	const { query, limit, offset } = result.data;

	// --- Extract session ---
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

	const user = session?.user;
	console.log("user", user);

	// --- Search courses ---
	let matchedCourses;

	if (user?.role === 'instructor' && user?.id) {
		matchedCourses = await db
			.select()
			.from(courses)
			.where(and(
				ilike(courses.title, `%${query}%`),
				eq(courses.instructorId, user.id)
			))
			.orderBy(courses.createdAt)
			.limit(limit)
			.offset(offset);
	} else {
		matchedCourses = await db
			.select()
			.from(courses)
			.where(ilike(courses.title, `%${query}%`))
			.orderBy(courses.createdAt)
			.limit(limit)
			.offset(offset);
	}

	// --- Attach thumbnail URLs ---
	matchedCourses = await Promise.all(
		matchedCourses.map(async (course) => {
			if (course.thumbnailFileId) {
				try {
					const file = trelae.file(course.thumbnailFileId);
					const url = await file.getDownloadUrl({ expire: 600 });
					return { ...course, thumbnailUrl: url };
				} catch (err) {
					console.warn(`Thumbnail fetch failed for course ${course.id}`, err);
				}
			}
			return course;
		})
	);

	return json(matchedCourses);
}
