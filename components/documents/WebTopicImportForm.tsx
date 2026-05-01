"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ImportWebTopicActionState } from "@/lib/documents/web-topic-actions";
import { importWebTopicAction } from "@/lib/documents/web-topic-actions";

const initialState: ImportWebTopicActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="ui-btn-primary">
      {pending ? "Searching and importing…" : "Import free web sources"}
    </button>
  );
}

export function WebTopicImportForm() {
  const [state, action] = useActionState(importWebTopicAction, initialState);

  return (
    <form action={action} className="ui-panel grid gap-6 p-6">
      <div className="space-y-2">
        <p className="ui-kicker">Web topic</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Pull sources from the open web (no API keys)
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">
          Uses the free{" "}
          <a className="font-medium text-cyan-800 underline-offset-2 hover:underline" href="https://www.wikipedia.org/">
            Wikipedia
          </a>{" "}
          catalog and{" "}
          <a
            className="font-medium text-cyan-800 underline-offset-2 hover:underline"
            href="https://html.duckduckgo.com/html/"
          >
            DuckDuckGo HTML results
          </a>
          . Each hit becomes its own document so you can search, summarize, and cite it like an upload. Many sites block
          automatic fetching; when that happens, the snippet from search is still ingested.
        </p>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Research topic
        <input
          name="webTopic"
          required
          placeholder="e.g. carbon pricing in the EU"
          className="ui-field"
          autoComplete="off"
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Wikipedia + DuckDuckGo · up to 8 sources per run
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
