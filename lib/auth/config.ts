import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { DEFAULT_LOGIN_REDIRECT, PROTECTED_PATH_PREFIXES } from "@/lib/auth/constants";

const githubConfigured =
  Boolean(process.env.AUTH_GITHUB_ID) && Boolean(process.env.AUTH_GITHUB_SECRET);

const demoEmail = "demo@researchcopilot.local";
const demoPassword = "researchcopilot-demo";

export const authConfig: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.id) {
        token.userId = user.id;
      }

      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? "";
      }

      return session;
    },
  },
};

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function shouldRedirectAuthenticatedUser(pathname: string, session: Session | null) {
  const isLoggedIn = Boolean(session?.user);
  const isSignInRoute = pathname.startsWith("/sign-in");

  if (isSignInRoute && isLoggedIn) {
    return DEFAULT_LOGIN_REDIRECT;
  }

  return null;
}

export const authProviderState = {
  githubConfigured,
  demoCredentialsEnabled: process.env.NODE_ENV !== "production",
  demoCredentials: {
    email: demoEmail,
    password: demoPassword,
  },
} as const;
