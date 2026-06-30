"use client";

import { create } from "zustand";
import { settingsRepository } from "@/lib/repositories/settings";
import { registerCustomTheme } from "@/lib/utils/themes";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { ThemeDefinition } from "@/types/themes";

let persistTimer: ReturnType<typeof setTimeout> | undefined;

function schedulePersist(next: Settings) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    settingsRepository.upsert(next);
    persistTimer = undefined;
  }, 300);
}

export const useSettingsStore = create<{
  settings: Settings;
  hydrated: boolean;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
}>((set) => ({
  settings: { ...DEFAULT_SETTINGS },
  hydrated: false,
  updateSettings: (partial) =>
    set((state) => {
      const next = { ...state.settings, ...partial };
      schedulePersist(next);
      return { settings: next };
    }),
  resetSettings: () => {
    if (persistTimer) clearTimeout(persistTimer);
    settingsRepository.upsert(DEFAULT_SETTINGS);
    set({ settings: { ...DEFAULT_SETTINGS } });
  },
}));

if (typeof indexedDB !== "undefined") {
  settingsRepository.find().then((saved) => {
    const merged = saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
    for (const t of merged.customThemes ?? []) {
      registerCustomTheme(t as ThemeDefinition);
    }
    useSettingsStore.setState({ settings: merged, hydrated: true });
  });
}
