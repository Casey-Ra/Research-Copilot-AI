import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";

type WorkspacePulseProps = {
  readyDocumentCount: number;
  failedDocumentCount: number;
  processingCoverage: number;
  noteBreakdown: {
    summary: number;
    search: number;
    compare: number;
    chat: number;
  };
};

export function WorkspacePulse({
  readyDocumentCount,
  failedDocumentCount,
  processingCoverage,
  noteBreakdown,
}: WorkspacePulseProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Workspace pulse
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Processing and capture health
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            A quick read on how much of the workspace is retrieval-ready and what kinds of research artifacts you are saving.
          </p>
        </div>
        <StatusBadge
          label={failedDocumentCount > 0 ? `${failedDocumentCount} failed docs` : "Healthy"}
          tone={failedDocumentCount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">Processing coverage</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">
              {processingCoverage}%
            </p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-cyan-500"
              style={{ width: `${processingCoverage}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {readyDocumentCount > 1
              ? "The workspace is ready for compare, search, summaries, and grounded chat."
              : readyDocumentCount === 1
                ? "Most workflows are unlocked, but document comparison will benefit from one more READY document."
                : "Upload and process documents to unlock retrieval-backed workflows."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={failedDocumentCount > 0 ? "/documents" : "/upload"}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {failedDocumentCount > 0 ? "Review failed docs" : "Add documents"}
            </Link>
            {readyDocumentCount > 1 ? (
              <Link
                href="/compare"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open compare
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Saved artifact mix</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Summaries", value: noteBreakdown.summary, href: "/notes?view=summary" },
              { label: "Search", value: noteBreakdown.search, href: "/notes?view=search" },
              { label: "Compare", value: noteBreakdown.compare, href: "/notes?view=compare" },
              { label: "Chat", value: noteBreakdown.chat, href: "/notes?view=chat" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-[1.25rem] border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {item.value}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
