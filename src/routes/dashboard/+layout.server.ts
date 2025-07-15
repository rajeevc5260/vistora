import { redirect } from '@sveltejs/kit';
import { getSessionFromCookie } from '../../lib/auth/session.js';

export const load = async (event) => {
	const authCookie = event.cookies.get('auth');

	let session = null;

	if (authCookie) {
		const decoded = await getSessionFromCookie(authCookie);
		if (decoded) session = { user: decoded };
	}

	//fallback to Google session
	if (!session && event.locals.auth) {
		const googleSession = await event.locals.auth();
		if (googleSession) session = googleSession;
	}

	if (!session) {
		throw redirect(302, '/login');
	}

	return { session };
};
