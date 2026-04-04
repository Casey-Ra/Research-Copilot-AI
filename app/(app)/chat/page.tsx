import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";

export default function ChatPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chat"
        title="Grounded Q&A placeholder"
        description="This route is reserved for the citation-backed research assistant experience. Prompting, retrieval, and message persistence will arrive in later phases."
      />

      <PlaceholderCard
        title="Chat orchestration"
        description="The eventual implementation will combine selected documents, top-k retrieval, grounded prompts, and citation rendering."
        status="Deferred"
      />
    </div>
  );
}
