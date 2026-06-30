"use client";

import { memo } from "react";

export const SettingRow = memo(function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-bg-hover/30 transition-colors gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-primary truncate">{label}</span>
        {description && <span className="text-xs text-muted truncate">{description}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
});
