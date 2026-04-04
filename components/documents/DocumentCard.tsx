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
}: DocumentCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {fileType}
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
            <p className="text-sm text-slate-600">{fileName}</p>
          </div>
          <StatusBadge label={status} tone={getStatusTone(status)} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] bg-slate-50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Chunks</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{chunkCount}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Notes</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{noteCount}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Updated {formatShortDate(updatedAt)}
          </p>
          <Link
            href={`/documents/${id}`}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open detail
          </Link>
        </div>
      </div>
    </article>
  );
}
