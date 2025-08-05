import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { courses, courseEnrollments, users } from '$lib/server/db/schema';
import { and, eq, ilike, inArray } from 'drizzle-orm';
import { getSessionFromCookie } from '$lib/auth/session';

export const load: PageServerLoad = async ({ url, cookies, locals }) => {
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

    if (!session?.user || session.user.role !== 'instructor') {
        throw new Response('Unauthorized', { status: 401 });
    }

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const instructorCourses = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.instructorId, session.user.id ?? ''));

    const courseIds = instructorCourses.map((c) => c.id);
    if (courseIds.length === 0) return { students: [], total: 0, page, limit };

    const enrollments = await db
        .select({
            userId: courseEnrollments.userId,
            courseId: courseEnrollments.courseId,
            courseTitle: courses.title,
        })
        .from(courseEnrollments)
        .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .where(inArray(courseEnrollments.courseId, courseIds));

    // group userId => [courseTitle]
    const studentCoursesMap: Record<string, string[]> = {};
    for (const enrollment of enrollments) {
        if (!studentCoursesMap[enrollment.userId]) {
            studentCoursesMap[enrollment.userId] = [];
        }
        studentCoursesMap[enrollment.userId].push(enrollment.courseTitle);
    }

    const uniqueUserIds = Object.keys(studentCoursesMap);
    const paginatedUserIds = uniqueUserIds.slice(offset, offset + limit);

    const students = await db
        .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
        .from(users)
        .where(inArray(users.id, paginatedUserIds));

    const enriched = students.map((s) => ({
        ...s,
        courses: studentCoursesMap[s.id] || []
    }));

    return {
        students: enriched,
        total: uniqueUserIds.length,
        page,
        limit
    };
};
