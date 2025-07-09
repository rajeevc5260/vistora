import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { randomUUID } from "crypto";

export const handle = SvelteKitAuth({
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      const email = user?.email;
      const googleId = user?.id;

      if (!email || !googleId) return false;

      const existing = await db.query.users.findFirst({
        where: (u, { or, eq }) =>
          or(eq(u.googleId, googleId), eq(u.email, email)),
      });

      if (!existing) {
        await db.insert(users).values({
          id: randomUUID(),
          email,
          googleId,
          name: user.name ?? null,
          avatarUrl: user.image ?? null,
          role: "viewer",
        });
      }

      return true;
    },
    async session({ session }) {
      const dbUser = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, session.user?.email ?? ""),
      });

      if (dbUser && session.user) {
        session.user.id = dbUser.id;
      }

      return session;
    },
    
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
}).handle;
