import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";

type DocumentDetailPageProps = {
  params: {
    id: string;
  };
};

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = params;
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Document Detail"
        title={`Document ${id}`}
        description="This placeholder detail page reserves the route shape for extracted text, chunk inspection, summaries, and grounded follow-up workflows."
      />

      <PlaceholderCard
        title="Document detail stub"
        description="Phase 0 keeps this route lightweight so later phases can add ownership checks, metadata panels, and retrieval-aware actions."
        status="Stub"
      />
    </div>
  );
}
