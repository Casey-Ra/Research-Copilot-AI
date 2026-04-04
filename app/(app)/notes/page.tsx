import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";

export default function NotesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Notes"
        title="Saved findings placeholder"
        description="Notes will become the destination for saved summaries, grounded answers, and manual research observations. Phase 0 only establishes the route and shared presentation patterns."
      />

      <PlaceholderCard
        title="Notes workspace"
        description="CRUD actions, note-source metadata, and save-from-chat flows are intentionally deferred until the core data models are in place."
        status="Deferred"
      />
    </div>
  );
}
