import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { trelae } from '$lib/utils/trelae';
import { randomUUID } from 'crypto';

const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    thumbnailBase64: z
        .string()
        .startsWith("data:image/")
        .optional()
});

export async function POST({ request, locals }) {
    const session = await locals.auth();

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

    return json({ id: course.id });
}


export async function GET({ url }) {
	const limit = parseInt(url.searchParams.get("limit") || "10");
	const offset = parseInt(url.searchParams.get("offset") || "0");

	let paginatedCourses = await db.query.courses.findMany({
		offset,
		limit,
		orderBy: (c, { desc }) => [desc(c.createdAt)]
	});

	paginatedCourses = await Promise.all(
		paginatedCourses.map(async (course) => {
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

	return json(paginatedCourses);
}