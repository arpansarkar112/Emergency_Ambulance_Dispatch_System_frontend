"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background p-6 text-center">
      <div className="rounded-2xl bg-destructive/10 p-4 text-destructive mb-5">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        An unexpected issue interrupted this view. You can safely retry below without losing your
        session.
      </p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
