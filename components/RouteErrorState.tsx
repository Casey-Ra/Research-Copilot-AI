"use client";

type RouteErrorStateProps = {
  title: string;
  description: string;
  reset: () => void;
};

export function RouteErrorState({ title, description, reset }: RouteErrorStateProps) {
  return (
    <div className="ui-panel border-rose-200/60">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
          Error state
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
        <button
          type="button"
          onClick={reset}
          className="ui-btn-primary px-4 py-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
