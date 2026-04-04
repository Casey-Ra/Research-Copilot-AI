import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { DEFAULT_LOGIN_REDIRECT, PROTECTED_PATH_PREFIXES } from "@/lib/auth/constants";

const githubConfigured =
  Boolean(process.env.AUTH_GITHUB_ID) && Boolean(process.env.AUTH_GITHUB_SECRET);

const demoEmail = "demo@researchcopilot.local";
const demoPassword = "researchcopilot-demo";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    ...(githubConfigured
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
          }),
        ]
      : []),
    ...(process.env.NODE_ENV !== "production"
      ? [
          Credentials({
            name: "Demo credentials",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              const email = credentials?.email;
              const password = credentials?.password;

              if (email === demoEmail && password === demoPassword) {
                return {
                  id: "demo-user",
                  name: "Demo Researcher",
                  email: demoEmail,
                };
              }

              return null;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtectedRoute = PROTECTED_PATH_PREFIXES.some((prefix) =>
        nextUrl.pathname.startsWith(prefix),
      );
      const isSignInRoute = nextUrl.pathname.startsWith("/sign-in");

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      if (isSignInRoute && isLoggedIn) {
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? "";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const authProviderState = {
  githubConfigured,
  demoCredentialsEnabled: process.env.NODE_ENV !== "production",
  demoCredentials: {
    email: demoEmail,
    password: demoPassword,
  },
} as const;
