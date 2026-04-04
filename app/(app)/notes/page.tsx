import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { NoteCard } from "@/components/notes/NoteCard";
import { requireUser } from "@/lib/auth/session";
import { getNotesForUser } from "@/lib/db/notes";
import {
  getNoteSourceLabel,
  getNoteTags,
  getNoteView,
} from "@/lib/notes/presentation";

type NotesPageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : undefined;
  const activeView = params?.view ?? "all";
  const notes = await getNotesForUser(user.id);
  const filteredNotes =
    activeView === "all" ? notes : notes.filter((note) => getNoteView(note) === activeView);
  const counts = {
    all: notes.length,
    summary: notes.filter((note) => getNoteView(note) === "summary").length,
    search: notes.filter((note) => getNoteView(note) === "search").length,
    compare: notes.filter((note) => getNoteView(note) === "compare").length,
    chat: notes.filter((note) => getNoteView(note) === "chat").length,
  };
  const views = [
    { id: "all", label: "All", count: counts.all },
    { id: "summary", label: "Summaries", count: counts.summary },
    { id: "search", label: "Search", count: counts.search },
    { id: "compare", label: "Compare", count: counts.compare },
    { id: "chat", label: "Chat", count: counts.chat },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Notes"
        title="Saved findings and reusable outputs"
        description="This notes workspace now stores durable research artifacts from summaries, search, comparison, and grounded chat. It acts as the persistent layer for discoveries made elsewhere in the product."
      />

      <section className="flex flex-wrap gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        {views.map((view) => {
          const isActive = view.id === activeView;

          return (
            <Link
              key={view.id}
              href={view.id === "all" ? "/notes" : `/notes?view=${view.id}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {view.label} ({view.count})
            </Link>
          );
        })}
      </section>

      {filteredNotes.length === 0 ? (
        <EmptyState
          eyebrow="Notes"
          title="No saved notes yet"
          description="Generate a document summary, save a search finding, or capture a comparison note to start building a reusable research notebook."
          actionLabel="Open documents"
          actionHref="/documents"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              title={note.title}
              content={note.content}
              sourceType={note.sourceType}
              sourceLabel={getNoteSourceLabel(note)}
              tags={getNoteTags(note.tags)}
              updatedAt={note.updatedAt}
              document={note.document}
            />
          ))}
        </div>
      )}
    </div>
  );
}
