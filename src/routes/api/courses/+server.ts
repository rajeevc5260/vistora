import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { courses, courseThumbnails, courseEnrollments } from '$lib/server/db/schema';
import { trelae } from '$lib/utils/trelae';
import { randomUUID } from 'crypto';
import { createSessionCookie, getSessionFromCookie } from '$lib/auth/session';

const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    thumbnailBase64: z
        .string()
        .startsWith("data:image/")
        .optional()
});

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

    console.log("Session:", session);
    console.log("Session user:", session?.user);

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, thumbnailBase64 } = parsed.data;

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

    const namespaceName = slugify(title);
    // Create Trelae namespace
    const namespace = await trelae.createNamespace({
        name: `${namespaceName}`,
        region: 'us-east-1',
        isPublic: false
    });

    console.log('Created Trelae namespace:', namespace);

    const namespaceId = namespace.getId();

    console.log('Created Trelae namespace:', namespaceId);

    let thumbnailFileId: string | undefined;

    if (thumbnailBase64) {
        const { buffer, contentType } = decodeBase64Image(thumbnailBase64);

        const uploadRequest = await trelae
            .namespace(namespaceId)
            .getUploadUrl({
                name: `${namespaceName}-thumbnail.png`,
                location: `thumbnail`
            });

        console.log('Upload request:', uploadRequest);

        await fetch(uploadRequest.uploadUrl, {
            method: "PUT",
            body: buffer,
            headers: {
                "Content-Type": contentType
            }
        });

        thumbnailFileId = uploadRequest.id;
        console.log('Thumbnail uploaded:', thumbnailFileId);
    }

    const [course] = await db
        .insert(courses)
        .values({
            id: randomUUID(),
            title,
            description,
            thumbnailFileId,
            instructorId: session.user.id,
            namespaceId: namespaceId
        })
        .returning({ id: courses.id });

    // insert thumbnail record if uploaded
    if (thumbnailFileId) {
        await db.insert(courseThumbnails).values({
            name: `${namespaceName}-thumbnail.png`,
            courseId: course.id,
            fileId: thumbnailFileId,
            location: 'thumbnail',
        });
    }

    return json({ id: course.id });
}


export async function GET({ url, locals, cookies }) {
	const limit = parseInt(url.searchParams.get("limit") || "10");
	const offset = parseInt(url.searchParams.get("offset") || "0");

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

	let paginatedCourses;

	if (user?.role === "instructor" && user?.id) {
        paginatedCourses = await db.query.courses.findMany({
          where: (c, { eq }) => eq(c.instructorId, user.id!), // <-- non-null assertion
          offset,
          limit,
          orderBy: (c, { desc }) => [desc(c.createdAt)]
        });
    } else {
		paginatedCourses = await db.query.courses.findMany({
			offset,
			limit,
			orderBy: (c, { desc }) => [desc(c.createdAt)]
		});
	}

	const favoriteSet = new Set<string>();
	if (user?.id) {
		const favoritesList = await db.query.favorites.findMany({
			where: (f, { eq }) => eq(f.userId, user.id!),
			columns: { courseId: true }
		});
		favoritesList.forEach((f) => favoriteSet.add(f.courseId));
	}

	paginatedCourses = await Promise.all(
		paginatedCourses.map(async (course) => {
			let thumbnailUrl: string | undefined = undefined;
			let isEnrolled = false;

			if (course.thumbnailFileId) {
				try {
					const file = trelae.file(course.thumbnailFileId);
					thumbnailUrl = await file.getDownloadUrl({ expire: 600 });
				} catch (err) {
					console.warn(`Thumbnail fetch failed for course ${course.id}`, err);
				}
			}

			if (user?.role === 'viewer' && user?.id) {
				const enrolled = await db.query.courseEnrollments.findFirst({
					where: (e, { and, eq }) =>
						and(eq(e.courseId, course.id), eq(e.userId, user.id!)),
				});
				isEnrolled = !!enrolled;
			}

			const isFavorited = user?.id ? favoriteSet.has(course.id) : false;

			return { ...course, thumbnailUrl, isEnrolled, isFavorited };
		})
	);

	return json(paginatedCourses);
}

