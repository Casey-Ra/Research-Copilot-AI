import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Search"
        title="Semantic search placeholder"
        description="The retrieval layer is intentionally deferred. This route establishes where ranked chunk results and filters will live once embeddings and vector search are added."
      />

      <PlaceholderCard
        title="Retrieval UI scaffold"
        description="Future work will add query input, source metadata, result ranking, and empty or loading states tied to semantic search."
        status="Deferred"
      />
    </div>
  );
}
