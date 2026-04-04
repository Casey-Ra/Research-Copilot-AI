export default function GlobalLoading() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Loading</p>
        <p className="text-sm text-slate-600">
          Preparing the Research Copilot AI workspace.
        </p>
      </div>
    </div>
  );
}
