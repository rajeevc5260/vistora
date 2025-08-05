import { db } from '$lib/server/db';
import { courses, courseEnrollments, users } from '$lib/server/db/schema';
import { getSessionFromCookie } from '$lib/auth/session';
import { and, eq, ilike, inArray } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, cookies, locals }) => {
    const { query } = await request.json();

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
        return json({ students: [] }, { status: 401 });
    }

    const instructorCourses = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.instructorId, session.user.id as string));

    const courseIds = instructorCourses.map((c) => c.id);
    if (courseIds.length === 0) return json({ students: [] });

    const enrollments = await db
        .select({
            userId: courseEnrollments.userId,
            courseId: courseEnrollments.courseId,
            courseTitle: courses.title,
        })
        .from(courseEnrollments)
        .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .where(inArray(courseEnrollments.courseId, courseIds));

    const studentCoursesMap: Record<string, string[]> = {};
    for (const enrollment of enrollments) {
        if (!studentCoursesMap[enrollment.userId]) {
            studentCoursesMap[enrollment.userId] = [];
        }
        studentCoursesMap[enrollment.userId].push(enrollment.courseTitle);
    }

    const uniqueUserIds = Object.keys(studentCoursesMap);

    const filteredStudents = await db
        .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
        .from(users)
        .where(and(
            inArray(users.id, uniqueUserIds),
            ilike(users.name, `%${query}%`)
        ));

    const enriched = filteredStudents.map((s) => ({
        ...s,
        courses: studentCoursesMap[s.id] || []
    }));

    return json({ students: enriched });
};
