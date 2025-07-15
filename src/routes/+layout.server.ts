import { getSessionFromCookie } from '$lib/auth/session';

export const load = async (event) => {
	const cookie = event.cookies.get('auth');

	let session = null;

	if (cookie) {
		const decoded = await getSessionFromCookie(cookie);
		if (decoded) session = { user: decoded };
	}

	// Google session (via @auth/sveltekit)
	if (!session && event.locals.auth) {
		const googleSession = await event.locals.auth();
		if (googleSession) session = googleSession;
	}

	return {
		session
	};
};