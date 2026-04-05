"use client";

import { signIn } from "next-auth/react";

type GitHubSignInButtonProps = {
  callbackUrl: string;
};

export function GitHubSignInButton({ callbackUrl }: GitHubSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={async () => {
        await signIn("github", { callbackUrl });
      }}
      className="ui-btn-accent"
    >
      Continue with GitHub
    </button>
  );
}
