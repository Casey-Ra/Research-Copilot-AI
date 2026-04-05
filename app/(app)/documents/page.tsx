import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { requireUser } from "@/lib/auth/session";
import { getUserDocuments } from "@/lib/db/documents";

export default async function DocumentsPage() {
  const user = await requireUser();
  const documents = await getUserDocuments(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Documents"
        title="Your documents"
        description="Open a file, check its status, and jump into summaries, search, or chat."
      />

      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Add a document</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Add TXT, PDF, or pasted text
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Bring in source material so you can search it, summarize it, compare it, or ask
            questions about it.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Open upload page
        </Link>
      </section>

      {documents.length === 0 ? (
        <EmptyState
          eyebrow="Documents"
          title="No documents yet"
          description="Upload a TXT or PDF file, or paste text, to create your first document."
          actionLabel="Go to upload"
          actionHref="/upload"
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              id={document.id}
              title={document.title}
              fileName={document.fileName}
              fileType={document.fileType}
              status={document.status}
              updatedAt={document.updatedAt}
              chunkCount={document._count.chunks}
              noteCount={document._count.notes}
              fileSizeBytes={document.fileSizeBytes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
