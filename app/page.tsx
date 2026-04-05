import Link from "next/link";

const actions = [
  {
    href: "/upload",
    title: "Upload a file",
    description: "Add a PDF, TXT file, or pasted text so you can start working with it right away.",
  },
  {
    href: "/search",
    title: "Search for evidence",
    description: "Find the passages that matter most and jump straight back to the source.",
  },
  {
    href: "/chat",
    title: "Ask a question",
    description: "Get answers with citations pulled from your own documents.",
  },
  {
    href: "/compare",
    title: "Compare sources",
    description: "See where two documents agree, where they differ, and what supports each side.",
  },
  {
    href: "/notes",
    title: "Save what matters",
    description: "Keep the summaries, excerpts, and answers you want to revisit later.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <section className="ui-panel-hero overflow-hidden p-8 sm:p-10 lg:p-12">
        <div className="max-w-3xl space-y-5">
          <p className="ui-kicker-on-dark">Find answers in your documents</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.65rem]">
            Search, compare, summarize, and ask questions across your files.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-100/84 sm:text-lg">
            Bring in reports, articles, transcripts, and notes, then turn them into answers,
            evidence, and saved takeaways you can actually use.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sign-in" className="ui-btn-accent">
            Sign in to start
          </Link>
          <Link
            href="/upload"
            className="ui-btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white"
          >
            Upload a document
          </Link>
        </div>
      </section>

      <section className="ui-panel space-y-5 p-6 sm:p-7">
        <div className="space-y-2">
          <p className="ui-kicker">Start with a task</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Pick the job you need to get done
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Everything here is built around common research work: adding sources, finding the right
            passages, asking grounded questions, and saving the outputs you want to keep.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-[1.4rem] border border-[rgba(136,155,194,0.18)] bg-[linear-gradient(180deg,_rgba(243,247,255,0.92),_rgba(255,255,255,0.98))] p-5 transition hover:border-[rgba(47,103,218,0.28)] hover:bg-white"
            >
              <p className="ui-kicker">{action.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
