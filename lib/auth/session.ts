import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig, shouldRedirectAuthenticatedUser } from "@/lib/auth/config";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/constants";

export function resolveCallbackUrl(callbackUrl?: string | null) {
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return DEFAULT_LOGIN_REDIRECT;
  }

  return callbackUrl;
}

export async function getCurrentSession() {
  return getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getServerSession(authConfig);
  return session?.user ?? null;
}

export async function requireUser() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session.user;
}

export async function redirectAuthenticatedUser(pathname: string) {
  const session = await getServerSession(authConfig);
  const target = shouldRedirectAuthenticatedUser(pathname, session);

  if (target) {
    redirect(target);
  }
}
