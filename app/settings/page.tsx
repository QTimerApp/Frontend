"use client";

import { useState } from "react";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { SettingsTab } from "@/types/settings";
import { TABS, TAB_ICONS } from "@/features/settings/constants";
import { TAB_COMPONENTS } from "@/features/settings/tabs";
import { Refresh } from "@/components/icons";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.General);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const TabContent = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex-1 flex h-screen">
      <aside className="w-56 bg-bg-elevated flex flex-col shrink-0 border-r border-border/20">
        <div className="px-4 pt-6 pb-3">
          <h1 className="text-xs font-bold uppercase tracking-widest text-muted">Settings</h1>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
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
                    layoutId="settings-tab-bg"
                    className="absolute inset-0 rounded-lg bg-accent/[0.07]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {(() => { const Icon = TAB_ICONS[tab.id]; return Icon ? <Icon className="relative size-4 shrink-0" /> : null; })()}
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/20">
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
        <div className="max-w-2xl mx-auto p-6 pt-8">
          <TabContent />
        </div>
      </main>
    </div>
  );
}
