"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

type DocumentDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DocumentDetailError({ reset }: DocumentDetailErrorProps) {
  return (
    <RouteErrorState
      title="The document detail view could not load."
      description="We hit an unexpected problem while preparing this document detail page. Try again to reload the latest document state."
      reset={reset}
    />
  );
}
