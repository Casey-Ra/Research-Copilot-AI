import Link from "next/link";
import type { DocumentStatus } from "@prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import { formatShortDate } from "@/lib/utils/format";

type DocumentCardProps = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  status: DocumentStatus;
  updatedAt: Date;
  chunkCount: number;
  noteCount: number;
  fileSizeBytes: number | null;
};

function getStatusTone(status: DocumentStatus) {
  switch (status) {
    case "READY":
      return "success";
    case "PROCESSING":
      return "warning";
    case "FAILED":
      return "danger";
    default:
      return "neutral";
  }
}

export function DocumentCard({
  id,
  title,
  fileName,
  fileType,
  status,
  updatedAt,
  chunkCount,
  noteCount,
  fileSizeBytes,
}: DocumentCardProps) {
  return (
    <article className="ui-panel p-6 transition hover:-translate-y-0.5 hover:border-[rgba(47,103,218,0.24)]">
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="ui-kicker">
              {fileType}
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
            <p className="text-sm text-slate-600">{fileName}</p>
          </div>
          <StatusBadge label={status} tone={getStatusTone(status)} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] bg-[linear-gradient(180deg,_rgba(243,247,255,0.95),_rgba(255,253,246,0.92))] p-4">
          <div>
            <p className="ui-kicker">Chunks</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{chunkCount}</p>
          </div>
          <div>
            <p className="ui-kicker">Notes</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{noteCount}</p>
          </div>
          <div>
            <p className="ui-kicker">Size</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {fileSizeBytes ? `${Math.max(1, Math.round(fileSizeBytes / 1024))} KB` : "-"}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Updated {formatShortDate(updatedAt)}
          </p>
          <Link
            href={`/documents/${id}`}
            className="ui-btn-primary px-4 py-2"
          >
            Open detail
          </Link>
        </div>
      </div>
    </article>
  );
}
