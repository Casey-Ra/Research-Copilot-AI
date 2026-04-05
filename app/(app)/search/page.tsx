import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchSummary } from "@/components/search/SearchSummary";
import { requireUser } from "@/lib/auth/session";
import { getReadyDocumentsForUser } from "@/lib/db/retrieval";
import { semanticSearchDocuments } from "@/lib/retrieval";

type SearchPageProps = {
  searchParams?: Promise<{
    query?: string;
    documentId?: string | string[];
    fileType?: string | string[];
    dateWindow?: string;
    limit?: string;
  }>;
};

function coerceDocumentIds(value?: string | string[]) {
  if (!value) {
    return [] as string[];
  }

  return Array.isArray(value) ? value : [value];
}

function coerceFileTypes(value?: string | string[]) {
  if (!value) {
    return [] as string[];
  }

  return Array.isArray(value) ? value : [value];
}

function parseLimit(value?: string) {
  const parsed = Number(value);
  return parsed === 5 || parsed === 8 || parsed === 12 ? parsed : 8;
}

function parseDateWindow(value?: string) {
  const parsed = Number(value);
  return parsed === 7 || parsed === 30 || parsed === 90 ? parsed : null;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : undefined;
  const query = params?.query?.trim() ?? "";
  const selectedDocumentIds = coerceDocumentIds(params?.documentId);
  const selectedFileTypes = coerceFileTypes(params?.fileType);
  const dateWindowDays = parseDateWindow(params?.dateWindow);
  const limit = parseLimit(params?.limit);
  const updatedAfter = dateWindowDays
    ? new Date(Date.now() - dateWindowDays * 24 * 60 * 60 * 1000)
    : null;

  const readyDocuments = await getReadyDocumentsForUser(user.id);
  const searchResponse =
    query.length > 0
      ? await semanticSearchDocuments({
          userId: user.id,
          query,
          documentIds: selectedDocumentIds,
          fileTypes: selectedFileTypes,
          updatedAfter,
          limit,
        })
      : { results: [], totalCandidates: 0 };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Search"
        title="Search your documents"
        description="Find the most relevant passages across your files and jump back to the source."
      />

      <SearchFilters
        query={query}
        selectedDocumentIds={selectedDocumentIds}
        selectedFileTypes={selectedFileTypes}
        dateWindowDays={dateWindowDays}
        limit={limit}
        documents={readyDocuments.map((document) => ({
          id: document.id,
          title: document.title,
          fileName: document.fileName,
          fileType: document.fileType,
          chunkCount: document._count.chunks,
        }))}
      />

      {query.length === 0 ? (
        <EmptyState
          eyebrow="Search"
          title="Start with a question or topic"
          description="Search across your processed documents, then narrow the results by file, type, or recency."
        />
      ) : searchResponse.results.length === 0 ? (
        <EmptyState
          eyebrow="Search"
          title="No matching chunks found"
          description="Try a broader question, remove document filters, or upload and process more documents."
        />
      ) : (
        <>
          <SearchSummary
            query={query}
            resultCount={searchResponse.results.length}
            totalCandidates={searchResponse.totalCandidates}
            selectedDocumentCount={selectedDocumentIds.length}
            selectedFileTypes={selectedFileTypes}
            dateWindowDays={dateWindowDays}
            limit={limit}
          />

          <div className="space-y-4">
            {searchResponse.results.map((result, index) => (
              <SearchResultCard
                key={result.chunkId}
                rank={index + 1}
                query={query}
                result={result}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
