import { SignJWT, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';

const secret = new TextEncoder().encode(env.AUTH_SECRET);

/**
 * Creates a JWT for the user, storing it in a cookie later
 */
export async function createSessionCookie(user: {
	id: string;
	email: string;
	role: string;
	name?: string | null;
	image?: string | null;
}) {
	return await new SignJWT({
		id: user.id,
		email: user.email,
		role: user.role,
		name: user.name ?? null,
		image: user.image ?? null,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('7d')
		.sign(secret);
}

/**
 * Decodes a session from the `auth` cookie
 */
export async function getSessionFromCookie(cookieValue: string) {
	try {
		const { payload } = await jwtVerify(cookieValue, secret);
		return payload as {
			id: string;
			email: string;
			role: string;
			name?: string | null;
			image?: string | null;
		};
	} catch (err) {
		return null;
	}
}
