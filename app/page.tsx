import Link from "next/link";

const sections = [
  {
    href: "/upload",
    title: "Upload",
    description: "Upload TXT, PDF, or pasted text into a local development storage pipeline.",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "A home base for uploads, recent research activity, and saved findings.",
  },
  {
    href: "/documents",
    title: "Documents",
    description: "Manage source files and drill into each document's processing lifecycle.",
  },
  {
    href: "/compare",
    title: "Compare",
    description: "Compare two processed documents side by side with grounded overlap and unique evidence.",
  },
  {
    href: "/search",
    title: "Semantic Search",
    description: "Search across document chunks with future-ready retrieval abstractions.",
  },
  {
    href: "/chat",
    title: "Grounded Chat",
    description: "Ask citation-backed questions against your uploaded research corpus.",
  },
  {
    href: "/notes",
    title: "Notes",
    description: "Capture summaries, insights, and reusable findings in one place.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-50 shadow-[0_30px_80px_rgba(2,12,27,0.28)] backdrop-blur sm:p-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Phase 0 Foundation
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Research Copilot AI starts with a clean, extensible document intelligence foundation.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              This starter phase sets up the app shell, placeholder workflows, Prisma scaffolding,
              and service boundaries for authentication, document parsing, retrieval, and LLM
              features.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Explore app shell
            </Link>
            <Link
              href="/documents"
              className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
            >
              View placeholder routes
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Architecture priorities
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>Typed service boundaries between UI, DB, parsing, retrieval, and LLM logic.</li>
              <li>Prisma and Postgres scaffolding ready before feature work begins.</li>
              <li>Placeholder routes that make later feature phases easy to layer in.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            App Sections
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Foundation routes for every core workflow
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Placeholder route
                </div>
                <h3 className="text-xl font-semibold text-slate-950">{section.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{section.description}</p>
                <span className="text-sm font-semibold text-cyan-700 transition group-hover:text-cyan-500">
                  Open section
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
