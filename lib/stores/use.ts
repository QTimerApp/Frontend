import { create } from "zustand";
import type { UserProfile } from "@/types/user";

function loadExpandedCats(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("expandedCats");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveExpandedCats(cats: string[]) {
  try {
    localStorage.setItem("expandedCats", JSON.stringify(cats));
  } catch {}
}

export const useStore = create<{
  scramble: string;
  setScramble: (scramble: string) => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  expandedCats: string[];
  toggleExpandedCat: (id: string) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}>((set) => ({
  scramble: "",
  setScramble: (scramble) => set({ scramble }),
  selectedSessionId: null,
  setSelectedSessionId: (id) => set({ selectedSessionId: id }),
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  expandedCats: loadExpandedCats(),
  toggleExpandedCat: (id) =>
    set((state) => {
      const next = state.expandedCats.includes(id)
        ? state.expandedCats.filter((x) => x !== id)
        : [...state.expandedCats, id];
      saveExpandedCats(next);
      return { expandedCats: next };
    }),
  user: null,
  setUser: (user) => set({ user }),
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
