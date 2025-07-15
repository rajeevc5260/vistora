import { error } from '@sveltejs/kit';

// export async function GET({ url }) {
// 	const targetUrl = url.searchParams.get('url');
// 	if (!targetUrl) throw error(400, 'Missing url param');

// 	const res = await fetch(targetUrl);
// 	if (!res.ok) throw error(res.status, 'Failed to fetch image');

// 	const headers = new Headers(res.headers);
//     console.log("headers", headers)
// 	headers.set('Access-Control-Allow-Origin', '*');

// 	return new Response(await res.arrayBuffer(), {
// 		headers,
// 		status: res.status,
// 	});
// }

export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');
	if (!targetUrl) throw error(400, 'Missing url param');

	const res = await fetch(targetUrl);
	if (!res.ok) throw error(res.status, 'Failed to fetch image');

	// Clone headers and set CORS
	const headers = new Headers(res.headers);
    console.log("headers", headers)
	headers.set('Access-Control-Allow-Origin', '*');

	// Stream the response directly without buffering
	return new Response(res.body, {
		headers,
		status: res.status,
	});
}
