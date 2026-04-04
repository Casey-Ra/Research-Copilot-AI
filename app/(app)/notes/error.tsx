"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

type NotesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NotesError({ reset }: NotesErrorProps) {
  return (
    <RouteErrorState
      title="The notes workspace could not load."
      description="We hit an unexpected problem while loading saved findings for this workspace. Try again to re-run the request."
      reset={reset}
    />
  );
}
