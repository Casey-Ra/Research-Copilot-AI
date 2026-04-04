export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-sm" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
