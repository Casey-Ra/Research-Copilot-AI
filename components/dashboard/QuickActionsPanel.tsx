import Link from "next/link";

type QuickActionsPanelProps = {
  readyDocumentCount: number;
  noteCount: number;
};

const actions = [
  {
    href: "/upload",
    title: "Add source material",
    description: "Upload another PDF, TXT file, or pasted text into the workspace.",
  },
  {
    href: "/search",
    title: "Run semantic search",
    description: "Find relevant chunks and save the strongest hits into notes.",
  },
  {
    href: "/compare",
    title: "Compare documents",
    description: "Look for overlap and differences across two READY documents.",
  },
  {
    href: "/chat",
    title: "Ask grounded questions",
    description: "Open a retrieval-backed chat session with citations.",
  },
  {
    href: "/notes",
    title: "Review saved findings",
    description: "Open the notes workspace to revisit summaries and captured evidence.",
  },
];

export function QuickActionsPanel({
  readyDocumentCount,
  noteCount,
}: QuickActionsPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Quick actions
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Keep the research loop moving
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          {readyDocumentCount > 0
            ? `You have ${readyDocumentCount} READY document${readyDocumentCount === 1 ? "" : "s"} available for retrieval-based workflows.`
            : "Upload and process a document first to unlock retrieval-based workflows."}{" "}
          {noteCount > 0
            ? `You have ${noteCount} saved note${noteCount === 1 ? "" : "s"} to revisit.`
            : "Saved notes will appear as you capture useful findings."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-sm"
          >
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-950">{action.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{action.description}</p>
              <span className="text-sm font-semibold text-cyan-700">Open workflow</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
