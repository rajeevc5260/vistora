import { json } from '@sveltejs/kit';
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

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { name } = await request.json();
    if (!name) return json({ error: "Missing name" }, { status: 400 });

    // Create a temporary namespace for presign
    const tempNamespace = await trelae.createNamespace({
        name: `temp-${crypto.randomUUID()}`,
        region: 'us-east-1',
        isPublic: false
    });

    const upload = await trelae
        .namespace(tempNamespace.getId())
        .getUploadUrl({ name, location: 'thumbnail' });

    return json({
        uploadUrl: upload.uploadUrl,
        id: upload.id
    });
}
