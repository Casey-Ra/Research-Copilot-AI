"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { DEFAULT_LOGOUT_REDIRECT } from "@/lib/auth/constants";
import { resolveCallbackUrl } from "@/lib/auth/session";

export type CredentialsFormState = {
  error?: string;
};

export async function signInWithGitHubAction(formData: FormData) {
  const callbackUrl = resolveCallbackUrl(formData.get("callbackUrl")?.toString());

  await signIn("github", {
    redirectTo: callbackUrl,
  });
}

export async function signInWithDemoAction(
  _previousState: CredentialsFormState,
  formData: FormData,
): Promise<CredentialsFormState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const callbackUrl = resolveCallbackUrl(formData.get("callbackUrl")?.toString());

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Those demo credentials were not accepted. Double-check the email and password.",
        };
      }

      return {
        error: "Sign-in failed unexpectedly. Please try again.",
      };
    }

    throw error;
  }
}

export async function signOutAction() {
  await signOut({
    redirectTo: DEFAULT_LOGOUT_REDIRECT,
  });
}
