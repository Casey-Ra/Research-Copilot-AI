import { PanelSkeleton } from "@/components/loading/PanelSkeleton";

export default function DocumentDetailLoading() {
  return (
    <div className="space-y-6">
      <PanelSkeleton className="h-28" />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PanelSkeleton className="h-[72rem]" />
        <div className="space-y-6">
          <PanelSkeleton className="h-[26rem]" />
          <PanelSkeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
