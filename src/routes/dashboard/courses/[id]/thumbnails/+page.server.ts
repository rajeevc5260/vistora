import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { courses, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

    return {
        course: {
            ...rawCourse,
        }
    };
};
