import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { CreateDocumentForm } from "@/components/documents/CreateDocumentForm";
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
        title="Manage the research corpus for this workspace"
        description="This page now shows real user-owned document records from the database and includes a simple draft-create flow until the full upload pipeline lands in the next phase."
      />

      <CreateDocumentForm />

      {documents.length === 0 ? (
        <EmptyState
          eyebrow="Documents"
          title="No documents yet"
          description="Create a draft document above to start populating your workspace. File uploads, storage, and parsing will replace this bridge workflow in the next phases."
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
