import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatShortDateTime } from "@/lib/utils/format";

type ActivityItem = {
  id: string;
  title: string;
  meta?: string;
  updatedAt: Date;
  href?: string;
  badge?: {
    label: string;
    tone?: "neutral" | "success" | "warning" | "danger";
  };
};

type ActivitySectionProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ActivityItem[];
};

export function ActivitySection({
  title,
  description,
  emptyTitle,
  emptyDescription,
  items,
}: ActivitySectionProps) {
  return (
    <section className="ui-panel p-6">
      <div className="flex flex-col gap-2 border-b border-[rgba(136,155,194,0.14)] pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="pt-6">
          <EmptyState
            eyebrow={title}
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="divide-y divide-[rgba(136,155,194,0.14)]">
          {items.map((item) => {
            const content = (
              <div className="flex flex-col gap-3 rounded-[1.1rem] px-1 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    {item.badge ? <StatusBadge {...item.badge} /> : null}
                  </div>
                  {item.meta ? <p className="text-sm text-slate-600">{item.meta}</p> : null}
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {formatShortDateTime(item.updatedAt)}
                </p>
              </div>
            );

            return item.href ? (
              <Link key={item.id} href={item.href} className="block transition hover:bg-white/55">
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}
