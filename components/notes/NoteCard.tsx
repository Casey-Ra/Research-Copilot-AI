import type { ReactNode } from "react";
import Link from "next/link";
import type { NoteSourceType } from "@prisma/client";
import { formatShortDateTime } from "@/lib/utils/format";

type NoteCardProps = {
  title: string;
  content: string;
  sourceType: NoteSourceType;
  sourceLabel?: string;
  tags?: string[];
  updatedAt: Date;
  actions?: ReactNode;
  document?: {
    id: string;
    title: string;
    fileName: string;
  } | null;
};

function formatSourceType(sourceType: NoteSourceType) {
  return sourceType.toLowerCase().replace("_", " ");
}

export function NoteCard({
  title,
  content,
  sourceType,
  sourceLabel,
  tags,
  updatedAt,
  actions,
  document,
}: NoteCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            {sourceLabel ?? formatSourceType(sourceType)}
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
          Updated {formatShortDateTime(updatedAt)}
        </p>
      </div>

      {tags && tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 rounded-[1.25rem] bg-slate-50 p-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{content}</p>
      </div>

      {document || actions ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {document ? (
            <div className="text-sm text-slate-600">
              Source document: <span className="font-medium text-slate-950">{document.title}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-3">
            {actions}
            {document ? (
              <Link
                href={`/documents/${document.id}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open document
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
