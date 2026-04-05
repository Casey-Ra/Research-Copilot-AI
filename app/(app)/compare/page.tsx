import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { CompareFilters } from "@/components/compare/CompareFilters";
import { ComparisonOverview } from "@/components/compare/ComparisonOverview";
import { PossibleContradictionsPanel } from "@/components/compare/PossibleContradictionsPanel";
import { SharedEvidenceCard } from "@/components/compare/SharedEvidenceCard";
import { UniqueEvidencePanel } from "@/components/compare/UniqueEvidencePanel";
import { requireUser } from "@/lib/auth/session";
import { compareDocumentsForUser } from "@/lib/documents/comparison";
import { getReadyDocumentsForUser } from "@/lib/db/retrieval";

type ComparePageProps = {
  searchParams?: Promise<{
    left?: string;
    right?: string;
    focus?: string;
  }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : undefined;
  const leftDocumentId = params?.left?.trim() ?? "";
  const rightDocumentId = params?.right?.trim() ?? "";
  const focusQuery = params?.focus?.trim() ?? "";
  const documents = await getReadyDocumentsForUser(user.id);
  let comparison = null;
  let comparisonError: string | null = null;

  if (leftDocumentId && rightDocumentId) {
    if (leftDocumentId === rightDocumentId) {
      comparisonError = "Choose two different READY documents to run a meaningful comparison.";
    } else {
      try {
        comparison = await compareDocumentsForUser({
          userId: user.id,
          leftDocumentId,
          rightDocumentId,
          focusQuery,
        });
      } catch (error) {
        comparisonError =
          error instanceof Error
            ? error.message
            : "The selected documents could not be compared right now.";
      }
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compare"
        title="Compare two documents"
        description="See where two sources agree, where they differ, and which passages support each view."
      />

      {documents.length < 2 ? (
        <EmptyState
          eyebrow="Compare"
          title="You need at least two ready documents"
          description="Upload and process at least two documents before comparing them here."
          actionLabel="Open upload"
          actionHref="/upload"
        />
      ) : (
        <>
          <CompareFilters
            leftDocumentId={leftDocumentId}
            rightDocumentId={rightDocumentId}
            focusQuery={focusQuery}
            documents={documents.map((document) => ({
              id: document.id,
              title: document.title,
              fileName: document.fileName,
              fileType: document.fileType,
              chunkCount: document._count.chunks,
            }))}
          />

          {!comparison ? (
            <EmptyState
              eyebrow="Compare"
              title={comparisonError ? "Comparison unavailable" : "Pick two documents to begin"}
              description={
                comparisonError ??
                "Choose two documents above, then add an optional focus topic if you want to compare them around one question."
              }
            />
          ) : (
            <>
              <ComparisonOverview
                leftDocument={comparison.leftDocument}
                rightDocument={comparison.rightDocument}
                similarityScore={comparison.similarityScore}
                similarityLabel={comparison.similarityLabel}
                focusQuery={comparison.focusQuery}
                comparisonNarrative={comparison.comparisonNarrative}
                comparedChunkCount={comparison.comparedChunkCount}
              />

              <section className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Shared evidence
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Where the documents overlap
                  </h2>
                </div>

                {comparison.sharedEvidence.length === 0 ? (
                  <EmptyState
                    eyebrow="Shared evidence"
                    title="No strong overlaps surfaced"
                    description="Try adding a focus topic or compare a different pair of documents."
                  />
                ) : (
                  <div className="space-y-4">
                    {comparison.sharedEvidence.map((pair, index) => (
                      <SharedEvidenceCard
                        key={`${pair.left.id}-${pair.right.id}`}
                        rank={index + 1}
                        pair={pair}
                        leftTitle={comparison.leftDocument.title}
                        rightTitle={comparison.rightDocument.title}
                      />
                    ))}
                  </div>
                )}
              </section>

              <PossibleContradictionsPanel
                items={comparison.possibleContradictions}
                leftTitle={comparison.leftDocument.title}
                rightTitle={comparison.rightDocument.title}
              />

              <div className="grid gap-6 xl:grid-cols-2">
                <UniqueEvidencePanel
                  title={`Distinct to ${comparison.leftDocument.title}`}
                  description="Passages that stand out more clearly in this document."
                  items={comparison.uniqueToLeft}
                />
                <UniqueEvidencePanel
                  title={`Distinct to ${comparison.rightDocument.title}`}
                  description="Passages that stand out more clearly in this document."
                  items={comparison.uniqueToRight}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
