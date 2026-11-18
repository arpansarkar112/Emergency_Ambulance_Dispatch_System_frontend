"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useHighVolumeMode, useToggleHighVolumeMode } from "@/lib/store";
import { Database } from "lucide-react";

export const DatasetVolumeToggle = memo(function DatasetVolumeToggle({
  totalCount,
}: {
  totalCount?: number;
}) {
  const highVolumeMode = useHighVolumeMode();
  const toggleHighVolumeMode = useToggleHighVolumeMode();

  return (
    <Button
      type="button"
      variant={highVolumeMode ? "secondary" : "outline"}
      size="sm"
      onClick={toggleHighVolumeMode}
      className="h-10 gap-1.5 rounded-xl text-xs"
      title="Toggle between 1,200+ representative records for virtualization benchmarking and live database records only"
    >
      <Database className="h-3.5 w-3.5 text-primary" />
      {highVolumeMode
        ? `${(totalCount ?? 1200).toLocaleString()} Records (Virtual)`
        : "Live DB Only"}
    </Button>
  );
});
