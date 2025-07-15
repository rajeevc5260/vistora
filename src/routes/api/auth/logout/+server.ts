import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
  cookies.set('auth', '', {
    path: '/',
    expires: new Date(0),
  });

  return json({ success: true });
}