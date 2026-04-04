"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

type DocumentsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DocumentsError({ reset }: DocumentsErrorProps) {
  return (
    <RouteErrorState
      title="The documents view could not load."
      description="We hit an unexpected problem while reading document records for this workspace. Try again to re-run the request."
      reset={reset}
    />
  );
}
