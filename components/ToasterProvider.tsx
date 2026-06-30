"use client";

import { useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { Time } from "@/types/timer";

export { toast };

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      visibleToasts={4}
      toastOptions={{
        className: "text-sm",
        style: {
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        },
      }}
    />
  );
}

export function SettingsWatcher() {
  const settings = useSettingsStore((s) => s.settings);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const ready = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!ready.current) {
      ready.current = true;
      return;
    }
    if (settings.notifySettingsChange) {
      toast("Settings saved", {
        description: "Your preferences have been updated.",
        duration: Time.second * 2,
      });
    }
  }, [settings, hydrated]);

  return null;
}
