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
    <article className="ui-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="ui-kicker">
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
              className="ui-chip"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 rounded-[1.25rem] bg-[linear-gradient(180deg,_rgba(243,247,255,0.92),_rgba(255,253,246,0.92))] p-4">
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
                className="ui-btn-secondary px-4 py-2"
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
