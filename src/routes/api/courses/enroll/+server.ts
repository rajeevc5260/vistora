import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courseEnrollments } from '$lib/server/db/schema';
import { getSessionFromCookie } from '$lib/auth/session';
import { trelae } from '$lib/utils/trelae';

export async function POST({ request, locals, cookies }) {
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

    const { courseId } = await request.json();
    if (typeof courseId !== 'string' || !courseId) {
        return json({ error: "Missing or invalid courseId" }, { status: 400 });
    }

    await db.insert(courseEnrollments).values({
        courseId: courseId,
        userId: session.user.id as string,
    }).onConflictDoNothing();

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
	if (!user?.id || user.role !== 'viewer') {
		return json([], { status: 200 });
	}

	// Get list of enrolled course IDs
	const enrollments = await db.query.courseEnrollments.findMany({
		where: (e, { eq }) => eq(e.userId, user.id!),
		columns: { courseId: true }
	});

	const enrolledIds = enrollments.map(e => e.courseId);
	if (enrolledIds.length === 0) return json([]);

	// Get enrolled courses
	let enrolledCourses = await db.query.courses.findMany({
		where: (c, { inArray }) => inArray(c.id, enrolledIds),
		offset,
		limit,
		orderBy: (c, { desc }) => [desc(c.createdAt)]
	});

	// Optional in-memory filter (can be pushed to DB layer if needed)
	if (query) {
		enrolledCourses = enrolledCourses.filter(course =>
			course.title.toLowerCase().includes(query) ||
			course.description?.toLowerCase().includes(query)
		);
	}

	// Get favorited course IDs
	const favorites = await db.query.favorites.findMany({
		where: (f, { eq }) => eq(f.userId, user.id!),
		columns: { courseId: true }
	});
	const favoriteSet = new Set(favorites.map(f => f.courseId));

	// Append extra data
	const result = await Promise.all(
		enrolledCourses.map(async (course) => {
			let thumbnailUrl: string | undefined = undefined;
			try {
				if (course.thumbnailFileId) {
					const file = trelae.file(course.thumbnailFileId);
					thumbnailUrl = await file.getDownloadUrl();
				}
			} catch (err) {
				console.warn(`Thumbnail fetch failed for course ${course.id}`, err);
			}

			return {
				...course,
				isEnrolled: true,
				isFavorited: favoriteSet.has(course.id),
				thumbnailUrl,
			};
		})
	);

	return json(result);
}
