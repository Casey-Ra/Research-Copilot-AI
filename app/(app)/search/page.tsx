import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { requireUser } from "@/lib/auth/session";
import { getReadyDocumentsForUser } from "@/lib/db/retrieval";
import { semanticSearchDocuments } from "@/lib/retrieval";

type SearchPageProps = {
  searchParams?: Promise<{
    query?: string;
    documentId?: string | string[];
  }>;
};

function coerceDocumentIds(value?: string | string[]) {
  if (!value) {
    return [] as string[];
  }

  return Array.isArray(value) ? value : [value];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : undefined;
  const query = params?.query?.trim() ?? "";
  const selectedDocumentIds = coerceDocumentIds(params?.documentId);

  const readyDocuments = await getReadyDocumentsForUser(user.id);
  const results =
    query.length > 0
      ? await semanticSearchDocuments({
          userId: user.id,
          query,
          documentIds: selectedDocumentIds,
          limit: 8,
        })
      : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Search"
        title="Semantic retrieval over processed document chunks"
        description="The parsing, chunking, and embedding pipeline now feeds a real user-scoped retrieval service. This page is a lightweight verification surface for that retrieval layer before the dedicated search polish phase."
      />

      <SearchFilters
        query={query}
        selectedDocumentIds={selectedDocumentIds}
        documents={readyDocuments.map((document) => ({
          id: document.id,
          title: document.title,
          fileName: document.fileName,
          chunkCount: document._count.chunks,
        }))}
      />

      {query.length === 0 ? (
        <EmptyState
          eyebrow="Search"
          title="Run your first semantic query"
          description="Enter a research question above to rank the most relevant embedded chunks across your READY documents."
        />
      ) : results.length === 0 ? (
        <EmptyState
          eyebrow="Search"
          title="No matching chunks found"
          description="Try a broader question, remove document filters, or upload and process more documents."
        />
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <SearchResultCard key={result.chunkId} rank={index + 1} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
