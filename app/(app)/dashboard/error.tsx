"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <RouteErrorState
      title="The dashboard could not load."
      description="We hit an unexpected problem while reading your workspace snapshot. Try again to re-run the server request."
      reset={reset}
    />
  );
}
