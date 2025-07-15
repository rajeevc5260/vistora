import { db } from '$lib/server/db';
import { courseMaterials } from '$lib/server/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { trelae } from '$lib/utils/trelae';
import { json } from '@sveltejs/kit';

export const POST = async ({ params, request }) => {
    const courseId = params.id;
    const { materialIds } = await request.json();

    if (!Array.isArray(materialIds) || materialIds.length === 0) {
        return json({ error: 'Invalid materialIds' }, { status: 400 });
    }

    // Get fileIds associated with the materials
    const materials = await db
        .select({ fileId: courseMaterials.fileId })
        .from(courseMaterials)
        .where(and(eq(courseMaterials.courseId, courseId), inArray(courseMaterials.id, materialIds)));

    const fileIds = materials.map((m) => m.fileId).filter(Boolean);

    // Delete files from Trelae
    if (fileIds.length > 0) {
        try {
            const files = trelae.files(fileIds);
            await files.delete();
        } catch (err) {
            console.error('Trelae delete error:', err);
            return json({ error: 'trelae-delete-failed' }, { status: 500 });
        }
    }

    // Delete from courseMaterials table
    await db
        .delete(courseMaterials)
        .where(and(eq(courseMaterials.courseId, courseId), inArray(courseMaterials.id, materialIds)));

    return json({ success: true });
};
