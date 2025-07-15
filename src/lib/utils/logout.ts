import { goto } from "$app/navigation";
import { signOut } from "@auth/sveltekit/client";

export async function logout() {
    // If Google user, call signOut from @auth
    await signOut({ redirect: false });

    // Always try clearing custom `auth` cookie
    await fetch('/api/auth/logout', { method: 'POST' });

    await goto('/login', { invalidateAll: true });
}