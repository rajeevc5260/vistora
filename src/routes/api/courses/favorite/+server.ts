import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { favorites } from '$lib/server/db/schema';
import { getSessionFromCookie } from '$lib/auth/session';
import { eq, and } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';

export async function POST({ request, cookies, locals }) {
    const { courseId, action } = await request.json();
    if (!courseId || !['favorite', 'unfavorite'].includes(action)) {
        return json({ error: 'Invalid input' }, { status: 400 });
    }

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

    if (action === 'favorite') {
        await db.insert(favorites).values({ courseId, userId }).onConflictDoNothing();
    } else {
        await db.delete(favorites)
    .where(and(
        eq(favorites.courseId, courseId),
        eq(favorites.userId, userId)
    ));
    }

    return json({ success: true });
}


export async function GET({ url, locals, cookies }) {
	const limit = parseInt(url.searchParams.get("limit") || "10");
	const offset = parseInt(url.searchParams.get("offset") || "0");
	const query = url.searchParams.get("query")?.trim().toLowerCase() || "";

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

	if (!user?.id || user.role !== "viewer") {
		return json([], { status: 200 }); // or return 401 if preferred
	}

	const favorites = await db.query.favorites.findMany({
		where: (f, { eq }) => eq(f.userId, user.id!),
		columns: { courseId: true }
	});

	const favoriteCourseIds = favorites.map(f => f.courseId);
	if (favoriteCourseIds.length === 0) return json([]);

	let filteredCourses = await db.query.courses.findMany({
		where: (c, { inArray }) => inArray(c.id, favoriteCourseIds),
		offset,
		limit,
		orderBy: (c, { desc }) => [desc(c.createdAt)]
	});

	// Search filtering (optional: move to DB-side for performance)
	if (query) {
		filteredCourses = filteredCourses.filter(course =>
			course.title.toLowerCase().includes(query) ||
			course.description?.toLowerCase().includes(query)
		);
	}

	const result = await Promise.all(
		filteredCourses.map(async (course) => {
			let thumbnailUrl: string | undefined = undefined;
			let isEnrolled = false;

			if (course.thumbnailFileId) {
				try {
					const file = trelae.file(course.thumbnailFileId);
					thumbnailUrl = await file.getDownloadUrl();
				} catch (err) {
					console.warn(`Thumbnail fetch failed for course ${course.id}`, err);
				}
			}

			const enrolled = await db.query.courseEnrollments.findFirst({
				where: (e, { and, eq }) =>
					and(eq(e.courseId, course.id), eq(e.userId, user.id!)),
			});
			isEnrolled = !!enrolled;

			return {
				...course,
				thumbnailUrl,
				isEnrolled,
				isFavorited: true,
			};
		})
	);

	return json(result);
}