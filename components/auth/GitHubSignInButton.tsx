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
      className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
    >
      Continue with GitHub
    </button>
  );
}
