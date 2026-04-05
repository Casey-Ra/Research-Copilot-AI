import Link from "next/link";

type EmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="ui-panel-soft border-dashed p-8 text-center">
      <div className="mx-auto max-w-xl space-y-3">
        <p className="ui-kicker">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="ui-btn-primary px-4 py-2"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
