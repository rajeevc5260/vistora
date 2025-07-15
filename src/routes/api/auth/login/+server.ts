import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSessionCookie } from '../../../../lib/auth/session.js'; // custom session logic

export async function POST({ request, cookies }) {
	const { email, password } = await request.json();

	const user = await db.query.users.findFirst({
		where: (u, { eq }) => eq(u.email, email)
	});

	if (!user || !user.passwordHash) {
		return json({ error: 'Invalid credentials' }, { status: 401 });
	}

	const valid = await bcrypt.compare(password, user.passwordHash);
	if (!valid) return json({ error: 'Invalid credentials' }, { status: 401 });

	// Only pass the required fields to createSessionCookie, ensuring role is a string
	const sessionCookie = await createSessionCookie({
		id: user.id,
		email: user.email,
		role: user.role ?? '',
		name: user.name ?? undefined,
		image: user.avatarUrl ?? undefined
	});

	cookies.set('auth', sessionCookie, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 7
	});

	return json({ success: true });
}
