import { db } from '$lib/server/db';
import { courses, courseThumbnails } from '$lib/server/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { json } from '@sveltejs/kit';
import z from 'zod';

export async function GET({ params, url }) {
    const courseId = params.id;

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) {
        return json({ error: 'Course not found' }, { status: 404 });
    }

    const query = url.searchParams.get('query')?.trim() || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    try {
        let baseQuery = db
            .select({
                name: courseThumbnails.name,
                fileId: courseThumbnails.fileId,
            })
            .from(courseThumbnails)
            .where(eq(courseThumbnails.courseId, courseId));

        if (query) {
            baseQuery = db
                .select({
                    name: courseThumbnails.name,
                    fileId: courseThumbnails.fileId,
                })
                .from(courseThumbnails)
                .where(
                    and(
                        eq(courseThumbnails.courseId, courseId),
                        ilike(courseThumbnails.name, `%${query}%`)
                    )
                );
        }

        const thumbnailRecords = await baseQuery.limit(limit).offset(offset);

        const thumbnails = await Promise.all(
            thumbnailRecords.map(async (record) => {
                const url = await trelae.file(record.fileId).getDownloadUrl();
                return {
                    id:record.fileId,
                    name: record.name,
                    url,
                };
            })
        );

        return json({ thumbnails });
    } catch (err) {
        console.error('Thumbnail listing failed:', err);
        return json({ error: 'Failed to list thumbnails' }, { status: 500 });
    }
}


const schema = z.object({
    thumbnailBase64: z.string().startsWith('data:image/'),
    name: z.string().optional()
});

export async function POST({ request, params, locals }) {
    const session = await locals.auth();
    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const courseId = params.id;
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) {
        return json({ error: "Course not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
    }

    const { thumbnailBase64, name } = parsed.data;

    function decodeBase64Image(base64: string) {
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) throw new Error("Invalid base64");

        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        return { buffer, contentType };
    }

    function slugify(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const courseName = slugify(course.title);

    const { buffer, contentType } = decodeBase64Image(thumbnailBase64);
    const filename = name || `${courseName}-thumbnail-${Date.now()}`;

    const uploadRequest = await trelae
        .namespace(course.namespaceId)
        .getUploadUrl({
            name: filename,
            location: 'thumbnail'
        });

    await fetch(uploadRequest.uploadUrl, {
        method: 'PUT',
        body: buffer,
        headers: {
            'Content-Type': contentType
        }
    });

    await db.insert(courseThumbnails).values({
        name: filename,
        fileId: uploadRequest.id,
        courseId: course.id,
        location: 'thumbnail'
    });

    return json({ success: true });
}

export async function PUT({ request, params, locals }) {
	const session = await locals.auth();
	if (!session || !session.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const courseId = params.id;
	const { fileId } = await request.json();

	if (!fileId) {
		return json({ error: 'Missing fileId' }, { status: 400 });
	}

	await db.update(courses)
		.set({ thumbnailFileId: fileId })
		.where(eq(courses.id, courseId));

	return json({ success: true });
}