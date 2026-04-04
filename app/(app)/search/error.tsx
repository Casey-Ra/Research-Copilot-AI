"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

type SearchErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SearchError({ reset }: SearchErrorProps) {
  return (
    <RouteErrorState
      title="Semantic search could not load."
      description="We hit an unexpected problem while preparing or running retrieval. Try again to re-run the request."
      reset={reset}
    />
  );
}
