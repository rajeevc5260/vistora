import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { trelae } from '$lib/utils/trelae';
import { randomUUID } from 'crypto';

const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    thumbnailUrl: z.string().url().optional()
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

    const { title, description, thumbnailUrl } = parsed.data;

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

    const [course] = await db
        .insert(courses)
        .values({
            id: randomUUID(),
            title,
            description,
            thumbnailUrl,
            instructorId: session.user.id,
            namespaceId: namespaceId
        })
        .returning({ id: courses.id });

    return json({ id: course.id });
}


export async function GET({ url }) {
	const limit = parseInt(url.searchParams.get("limit") || "10");
	const offset = parseInt(url.searchParams.get("offset") || "0");

	const paginatedCourses = await db.query.courses.findMany({
		offset,
		limit,
		orderBy: (c, { desc }) => [desc(c.createdAt)]
	});

	return json(paginatedCourses);
}