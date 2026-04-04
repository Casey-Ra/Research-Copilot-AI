"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

type UploadErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function UploadError({ reset }: UploadErrorProps) {
  return (
    <RouteErrorState
      title="The upload workspace could not load."
      description="We hit an unexpected problem while preparing the upload interface. Try again to re-run the server request."
      reset={reset}
    />
  );
}
