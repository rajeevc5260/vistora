import { json } from '@sveltejs/kit';
import { trelae } from '$lib/utils/trelae';

export async function GET({ params }) {
	const file = trelae.file(params.fileId);
	const url = await file.getDownloadUrl({ expire: 2400 });
	return json({ url });
}