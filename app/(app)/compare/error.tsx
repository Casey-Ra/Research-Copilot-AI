"use client";

import { useEffect } from "react";
import { RouteErrorState } from "@/components/RouteErrorState";

type CompareErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CompareError({ error, reset }: CompareErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteErrorState
      title="Comparison workflow unavailable"
      description="The document comparison workflow hit an unexpected issue. Try again or pick a different pair of documents."
      reset={reset}
    />
  );
}
