"use client";

import { create } from "zustand";
import { settingsRepository } from "@/lib/repositories/settings";
import { registerCustomTheme } from "@/lib/utils/themes";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { ThemeDefinition } from "@/types/themes";

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
      settingsRepository.upsert(next);
      return { settings: next };
    }),
  resetSettings: () => {
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
