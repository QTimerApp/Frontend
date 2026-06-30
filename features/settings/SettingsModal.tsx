"use client";

import { useState, useEffect, useRef } from "react";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { useStore } from "@/lib/stores/use";
import { Button } from "@/components/ui/Button";
import { Time } from "@/types/timer";
import { SettingsTab } from "@/types/settings";
import { TABS, TAB_ICONS } from "@/features/settings/constants";
import { TAB_COMPONENTS } from "@/features/settings/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Spinner, Refresh } from "@/components/icons";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

function SaveIndicator() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const settings = useSettingsStore((s) => s.settings);
  const prevRef = useRef(settings);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === settings) return;
    prevRef.current = settings;

    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(() => {
      setStatus("saved");
      timerRef.current = setTimeout(() => setStatus("idle"), Time.second * 2);
    }, 400);
  }, [settings]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {status !== "idle" && (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
            status === "saving"
              ? "text-amber-400 bg-amber-500/10"
              : "text-emerald-400 bg-emerald-500/10"
          }`}
        >
          {status === "saving" ? (
            <span className="flex items-center gap-1.5">
              <Spinner className="size-3" />
              Saving
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Check className="size-3" />
              Saved
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export function SettingsModal() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.General);
  const settingsOpen = useStore((s) => s.settingsOpen);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const TabContent = TAB_COMPONENTS[activeTab];
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <button type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm border-none"
            onClick={() => setSettingsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute flex overflow-hidden bg-bg-primary shadow-2xl ${
              isMobile
                ? "inset-0"
                : "inset-4 md:inset-8 rounded-2xl border border-border/30"
            }`}
          >
            {/* Mobile: horizontal tab bar at top */}
            {isMobile ? (
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                  <h1 className="text-xs font-bold uppercase tracking-widest text-muted">Settings</h1>
                  <div className="flex items-center gap-2">
                    <Button type="button"
                      onClick={resetSettings}
                      variant="ghost"
                      size="icon"
                      className="rounded-md"
                      aria-label="Reset settings"
                    >
                      <Refresh className="size-4" />
                    </Button>
                    <Button type="button"
                      onClick={() => setSettingsOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="rounded-md"
                      aria-label="Close settings"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto px-4 pb-2 shrink-0">
                  <div className="flex gap-1 min-w-0">
                    {TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const IconComponent = TAB_ICONS[tab.id];
                      return (
                        <button type="button"
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                            isActive
                              ? "text-accent font-medium bg-accent/[0.07]"
                              : "text-secondary hover:text-primary hover:bg-bg-hover/30"
                          }`}
                        >
                          {IconComponent && <IconComponent className="size-4" />}
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="h-px bg-border/20 shrink-0" />
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="max-w-xl mx-auto">
                    <TabContent />
                  </div>
                </div>
                <div className="shrink-0 px-4 py-2 border-t border-border/20">
                  <SaveIndicator />
                </div>
              </div>
            ) : (
              <>
                <aside className="w-52 shrink-0 bg-bg-elevated flex flex-col border-r border-border/20">
                  <div className="flex items-center justify-between px-4 pt-5 pb-3">
                    <h1 className="text-xs font-bold uppercase tracking-widest text-muted">Settings</h1>
                    <Button type="button"
                      onClick={() => setSettingsOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="rounded-md"
                      aria-label="Close settings"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto">
                    {TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button type="button"
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                            isActive
                              ? "text-accent font-medium bg-accent/[0.07]"
                              : "text-secondary hover:text-primary hover:bg-bg-hover/30"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="modal-settings-tab-bg"
                              className="absolute inset-0 rounded-lg bg-accent/[0.07]"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          {(() => {
                            const IconComponent = TAB_ICONS[tab.id];
                            return IconComponent ? <IconComponent className="relative size-4 shrink-0" /> : null;
                          })()}
                          <span className="relative">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                  <div className="p-3 border-t border-border/20 space-y-2">
                    <SaveIndicator />
                    <Button type="button"
                      onClick={resetSettings}
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-lg"
                    >
                      <Refresh className="size-3.5 mr-2" />
                      Reset defaults
                    </Button>
                  </div>
                </aside>
                <main className="flex-1 overflow-y-auto bg-bg-primary">
                  <div className="max-w-xl mx-auto p-6 pt-6">
                    <TabContent />
                  </div>
                </main>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
