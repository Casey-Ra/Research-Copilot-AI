"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { UploadDocumentActionState } from "@/lib/documents/actions";
import { uploadDocumentAction } from "@/lib/documents/actions";
import { cn } from "@/lib/utils/cn";

const initialState: UploadDocumentActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Uploading..." : "Upload document"}
    </button>
  );
}

export function UploadDocumentForm() {
  const [state, action] = useActionState(uploadDocumentAction, initialState);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const selectedLabel = useMemo(
    () => selectedFileName ?? "Drag a TXT or PDF here, or click to browse.",
    [selectedFileName],
  );

  return (
    <form action={action} className="grid gap-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Upload</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Add source material to your workspace
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">
          Files are stored locally for development, validated before ingestion, and processed into
          extracted text, chunks, and retrieval-ready document records.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Optional title override
            <input
              name="title"
              placeholder="2026 annual industry report"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label
            className={cn(
              "block rounded-[1.5rem] border border-dashed p-5 transition",
              isDragging
                ? "border-cyan-500 bg-cyan-50"
                : "border-slate-300 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50/40",
            )}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={() => setIsDragging(false)}
          >
            <span className="block text-sm font-semibold text-slate-950">File upload</span>
            <span className="mt-2 block text-sm leading-6 text-slate-600">{selectedLabel}</span>
            <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
              TXT or PDF, up to 10 MB
            </span>
            <input
              name="file"
              type="file"
              accept=".txt,.pdf,text/plain,application/pdf"
              className="sr-only"
              onChange={(event) => {
                setSelectedFileName(event.target.files?.[0]?.name ?? null);
              }}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="pastedText" className="text-sm font-medium text-slate-700">
            Or paste text
          </label>
          <textarea
            id="pastedText"
            name="pastedText"
            rows={12}
            placeholder="Paste article notes, meeting transcripts, or copied source text here if you do not want to upload a file."
            className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400"
          />
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            File upload and pasted text are mutually optional; submit either one.
          </p>
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Storage is local for development and abstracted for future cloud replacement
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
