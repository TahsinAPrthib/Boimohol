import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { describeDbError } from "@/lib/db-errors";

// What the browser receives as result.error when sign-in fails for a reason
// other than bad credentials. NextAuth URL-encodes a thrown error's message
// straight into its response, so this must be a fixed code and never the
// original error: a Prisma connection error names the database host.
const SIGN_IN_SERVER_ERROR = "ServerError";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "ইমেইল", type: "email" },
        password: { label: "পাসওয়ার্ড", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // A failed lookup -- typically Neon waking from sleep -- is not a wrong
        // password, so it must not come back as CredentialsSignin. Throwing is
        // what makes NextAuth report a different error code to the client.
        let user: User | null;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        } catch (err) {
          console.error(`[auth] database error during sign-in: ${describeDbError(err)}`);
          throw new Error(SIGN_IN_SERVER_ERROR);
        }
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // role rides along only so the UI can decide whether to show admin
    // affordances. It's baked into the token at login, so a demoted admin
    // would keep it until the token expires — every actual authorization
    // decision re-reads the role from the database (see src/lib/authz.ts).
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { username?: string }).username = token.username as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
