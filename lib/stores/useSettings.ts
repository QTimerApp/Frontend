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

const STORAGE_KEY = "qtimer-settings";

function loadSync(): Settings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function persistSync(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

const initialSettings: Settings = { ...DEFAULT_SETTINGS, ...loadSync() };

if (typeof window !== "undefined" && initialSettings.customThemes?.length) {
  for (const t of initialSettings.customThemes) {
    registerCustomTheme(t as ThemeDefinition);
  }
}

export const useSettingsStore = create<{
  settings: Settings;
  hydrated: boolean;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
}>((set) => ({
  settings: initialSettings,
  hydrated: true,
  updateSettings: (partial) =>
    set((state) => {
      const next = { ...state.settings, ...partial };
      schedulePersist(next);
      persistSync(next);
      return { settings: next };
    }),
  resetSettings: () => {
    if (persistTimer) clearTimeout(persistTimer);
    settingsRepository.upsert(DEFAULT_SETTINGS);
    persistSync(DEFAULT_SETTINGS);
    set({ settings: { ...DEFAULT_SETTINGS } });
  },
}));

if (typeof indexedDB !== "undefined") {
  settingsRepository.find().then((saved) => {
    if (!saved) return;
    const merged = { ...DEFAULT_SETTINGS, ...saved };
    for (const t of merged.customThemes ?? []) {
      registerCustomTheme(t as ThemeDefinition);
    }
    persistSync(merged);
    useSettingsStore.setState({ settings: merged });
  });
}
