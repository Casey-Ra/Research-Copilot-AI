"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOut({
          callbackUrl: "/",
        });
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
      >
        Sign out
      </button>
    </form>
  );
}
