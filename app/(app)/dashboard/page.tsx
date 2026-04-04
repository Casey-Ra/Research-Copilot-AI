import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";

const cards = [
  {
    title: "Uploads queue",
    description: "Document ingestion summaries will live here once storage and parsing are added.",
    status: "Stub",
  },
  {
    title: "Recent research activity",
    description: "Chat sessions, search history, and note highlights will be surfaced here later.",
    status: "Stub",
  },
  {
    title: "Workspace health",
    description: "Operational state, sync status, and background processing indicators come next.",
    status: "Stub",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="A portfolio-ready app shell starts here."
        description="This placeholder dashboard establishes the layout and visual direction before real user data, uploads, and retrieval flows are implemented."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <PlaceholderCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
