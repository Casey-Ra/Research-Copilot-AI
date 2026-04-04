type PlaceholderCardProps = {
  title: string;
  description: string;
  status: string;
};

export function PlaceholderCard({ title, description, status }: PlaceholderCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {status}
        </span>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </article>
  );
}
