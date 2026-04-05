type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  neutral: "border-[rgba(94,123,186,0.18)] bg-[rgba(47,103,218,0.08)] text-[#183a86]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-[rgba(47,103,218,0.2)] bg-[rgba(47,103,218,0.1)] text-[#183a86]",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
