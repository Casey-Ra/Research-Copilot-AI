import type { DocumentSummaryType } from "@/types/database";
import { generateDocumentSummaryAction } from "@/lib/documents/actions";

type GenerateSummaryButtonProps = {
  documentId: string;
  summaryType: DocumentSummaryType;
  label: string;
};

export function GenerateSummaryButton({
  documentId,
  summaryType,
  label,
}: GenerateSummaryButtonProps) {
  const action = generateDocumentSummaryAction.bind(null, documentId, summaryType);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        {label}
      </button>
    </form>
  );
}
