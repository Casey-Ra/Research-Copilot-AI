import { PanelSkeleton } from "@/components/loading/PanelSkeleton";

export default function NotesLoading() {
  return (
    <div className="space-y-6">
      <PanelSkeleton className="h-24" />
      <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
        <PanelSkeleton className="h-[28rem]" />
        <PanelSkeleton className="h-[18rem]" />
      </div>
      <PanelSkeleton className="h-24" />
      <div className="grid gap-5 xl:grid-cols-2">
        <PanelSkeleton className="h-72" />
        <PanelSkeleton className="h-72" />
      </div>
    </div>
  );
}
