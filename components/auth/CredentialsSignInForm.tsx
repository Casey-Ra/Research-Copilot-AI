"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type CredentialsSignInFormProps = {
  callbackUrl: string;
};

export function CredentialsSignInForm({ callbackUrl }: CredentialsSignInFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      callbackUrl,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Those demo credentials were not accepted. Double-check the email and password.");
      return;
    }

    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <form
      action={async (formData) => {
        await handleSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="demo@researchcopilot.local"
          className="ui-field"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          defaultValue="researchcopilot-demo"
          className="ui-field"
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="ui-btn-primary"
      >
        {pending ? "Signing in..." : "Sign in with demo credentials"}
      </button>
    </form>
  );
}
