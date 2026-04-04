import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Documents"
        title="Document management placeholder"
        description="Uploads, processing states, and document ownership flows will be added in later phases. This route is in place so navigation and layout are stable from the start."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard
          title="Upload pipeline"
          description="Local development storage and validation will be introduced in the upload phase."
          status="Planned"
        />
        <PlaceholderCard
          title="Document detail views"
          description="Each document will eventually expose extracted text, chunk metadata, summaries, and citation backlinks."
          status="Planned"
        />
      </div>
    </div>
  );
}
