import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	const { email, name, password } = await request.json();

	if (!email || !password || !name) {
		return json({ error: 'Missing fields' }, { status: 400 });
	}

	const existing = await db.query.users.findFirst({
		where: (u, { eq }) => eq(u.email, email)
	});
	if (existing) return json({ error: 'User already exists' }, { status: 409 });

	const passwordHash = await bcrypt.hash(password, 10);

	await db.insert(users).values({
		id: randomUUID(),
		email,
		name,
        googleId:randomUUID(),
        avatarUrl: "",
		passwordHash,
		role: 'instructor'
	});

	return json({ success: true });
}
