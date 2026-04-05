import { formatCompactNumber } from "@/lib/utils/format";

type MetricCardProps = {
  label: string;
  value: number;
  description: string;
};

export function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="ui-panel p-5">
      <div className="space-y-3">
        <p className="ui-kicker">{label}</p>
        <p className="text-4xl font-semibold tracking-tight text-slate-950">
          {formatCompactNumber(value)}
        </p>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </article>
  );
}
