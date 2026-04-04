"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CreateDocumentActionState } from "@/lib/documents/actions";
import { createDocumentAction } from "@/lib/documents/actions";

const initialState: CreateDocumentActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create draft document"}
    </button>
  );
}

export function CreateDocumentForm() {
  const [state, action] = useActionState(createDocumentAction, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Quick create
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Add a draft document record
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          This is a Phase 3 bridge before the upload pipeline exists. It creates a user-owned
          document row so the dashboard and document views can work with real data now.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Title
          <input
            name="title"
            required
            placeholder="Quarterly market research"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          File name
          <input
            name="fileName"
            required
            placeholder="quarterly-market-research.txt"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        File type
        <input
          name="fileType"
          required
          defaultValue="text/plain"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Uploads and parsing arrive in later phases
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
