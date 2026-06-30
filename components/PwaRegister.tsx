"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X } from "@/components/icons";

const DISMISSED_KEY = "pwa-install-dismissed";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(display-mode: fullscreen)").matches) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    setShowPrompt(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, "true");
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 inset-x-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-bg-elevated border border-border/20 shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 shrink-0 rounded-lg bg-accent/15 flex items-center justify-center">
          <Download className="size-4 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary truncate">Install QTimer</p>
          <p className="text-xs text-muted truncate">Add to your home screen for the best experience</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button"
          onClick={install}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-[var(--accent-text)] hover:opacity-90 transition-opacity border-none cursor-pointer"
        >
          Install
        </button>
        <button type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="size-7 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-bg-hover transition-colors border-none bg-transparent cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
