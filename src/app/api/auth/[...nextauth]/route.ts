// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // ✅ Utiliser l'adapter Prisma pour Google OAuth
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // ✅ Provider Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // ✅ Provider Credentials (garde existant)
    CredentialsProvider({
      name: "Email et mot de passe",
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

        return {
          id: user.id,
          name: user.name,
          email: user.email!,
          phone: user.phone ?? null,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // ✅ Callback JWT unifié pour Google + Credentials
    async jwt({ token, user, account, trigger }) {
      // Première connexion (user object présent)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.phone = (user as any).phone ?? null;
        token.role = (user as any).role ?? "USER";
        
        // Si connexion Google, récupérer les données de la DB
        if (account?.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { phone: true, role: true },
          });
          
          if (dbUser) {
            token.phone = dbUser.phone ?? null;
            token.role = dbUser.role;
          }
        }
      }

      // Refresh du token (mise à jour manuelle)
      if (trigger === "update" && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { email: true, phone: true, role: true },
        });

        if (freshUser) {
          token.email = freshUser.email ?? token.email;
          token.phone = freshUser.phone ?? null;
          token.role = freshUser.role;
        }
      }

      return token;
    },

    // ✅ Session callback
    async session({ session, token, user }) {
      if (session.user) {
        // Pour Google OAuth (avec adapter), utiliser user
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (user) {
          session.user.id = user.id;
          session.user.email = user.email;
          session.user.phone = (user as any).phone ?? null;
          session.user.role = (user as any).role ?? "USER";
        } 
        // Pour Credentials (JWT), utiliser token
        else if (token) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.phone = token.phone as string | null;
          session.user.role = token.role as "USER" | "ADMIN";
        }
      }

      return session;
    },

    // ✅ Redirection après connexion
    async redirect({ url, baseUrl }) {
      // Rediriger vers onboarding si pas de téléphone
      if (url === baseUrl) return `${baseUrl}/profil`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/profil`;
    },
  },

  session: {
    strategy: "jwt", // ✅ Nécessaire pour l'adapter Prisma + Google
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };