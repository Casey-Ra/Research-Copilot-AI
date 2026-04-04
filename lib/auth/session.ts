import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/constants";

export function resolveCallbackUrl(callbackUrl?: string | null) {
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return DEFAULT_LOGIN_REDIRECT;
  }

  return callbackUrl;
}

export async function getCurrentSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session.user;
}
