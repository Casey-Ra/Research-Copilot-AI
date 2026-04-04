import { formatCompactNumber } from "@/lib/utils/format";

type MetricCardProps = {
  label: string;
  value: number;
  description: string;
};

export function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-4xl font-semibold tracking-tight text-slate-950">
          {formatCompactNumber(value)}
        </p>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </article>
  );
}
