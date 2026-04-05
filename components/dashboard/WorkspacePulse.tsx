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
    <section className="ui-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="ui-kicker">Workspace pulse</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            What is ready right now
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            See how much of your content is ready to use and what kinds of notes you have saved.
          </p>
        </div>
        <StatusBadge
          label={failedDocumentCount > 0 ? `${failedDocumentCount} failed docs` : "Healthy"}
          tone={failedDocumentCount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="ui-panel-soft p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">Processing coverage</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">
              {processingCoverage}%
            </p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[rgba(47,103,218,0.12)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,_#0b1220,_#2f67da)]"
              style={{ width: `${processingCoverage}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {readyDocumentCount > 1
              ? "Your documents are ready for search, summaries, comparison, and chat."
              : readyDocumentCount === 1
                ? "Most actions are ready, and one more processed document will unlock comparison."
                : "Upload and process documents to start searching, comparing, and chatting with sources."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={failedDocumentCount > 0 ? "/documents" : "/upload"}
              className="ui-btn-secondary px-4 py-2"
            >
              {failedDocumentCount > 0 ? "Review failed docs" : "Add documents"}
            </Link>
            {readyDocumentCount > 1 ? (
              <Link
                href="/compare"
                className="ui-btn-primary px-4 py-2"
              >
                Open compare
              </Link>
            ) : null}
          </div>
        </div>

        <div className="ui-panel-soft p-5">
          <p className="text-sm font-semibold text-slate-950">Saved notes by type</p>
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
                className="rounded-[1.25rem] border border-[rgba(136,155,194,0.2)] bg-white/88 p-4 transition hover:border-[rgba(47,103,218,0.24)] hover:bg-white"
              >
                <p className="ui-kicker">
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
