export default function DocumentsLoading() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
        />
      ))}
    </div>
  );
}
