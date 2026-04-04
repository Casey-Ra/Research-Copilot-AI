export default function ChatLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
      <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
        <div className="h-[34rem] animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
        <div className="h-[34rem] animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
      </div>
    </div>
  );
}
