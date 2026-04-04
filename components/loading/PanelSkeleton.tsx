type PanelSkeletonProps = {
  className?: string;
};

export function PanelSkeleton({ className = "h-40" }: PanelSkeletonProps) {
  return (
    <div
      className={`${className} animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-sm`}
    />
  );
}
