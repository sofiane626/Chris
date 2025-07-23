import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;
        if (!user.email) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone ?? null,
        } satisfies {
          id: string;
          name: string | null;
          email: string;
          role: "USER" | "ADMIN";
          phone: string | null;
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof user === "object") {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as { role: "USER" | "ADMIN" }).role;
        token.phone = (user as { phone?: string | null }).phone ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.phone = token.phone ?? null;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url === baseUrl) return `${baseUrl}/profil`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/profil`;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
