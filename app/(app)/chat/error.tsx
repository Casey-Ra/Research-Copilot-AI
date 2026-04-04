"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

type ChatErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ChatError({ reset }: ChatErrorProps) {
  return (
    <RouteErrorState
      title="The grounded chat workspace could not load."
      description="We hit an unexpected problem while preparing chat sessions, messages, or document scope. Try again to rerun the request."
      reset={reset}
    />
  );
}
