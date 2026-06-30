"use client";

import { useState, useMemo, useCallback } from "react";
import { useSettingsStore } from "@/lib/stores/useSettings";
import type { ThemeCategory, ThemeDefinition } from "@/types/themes";
import {
  CATEGORIES,
  getAllThemes,
  searchThemes,
  registerCustomTheme,
  unregisterCustomTheme,
  getThemeById,
} from "@/lib/utils/themes";
import { COLOR_FIELDS, COLOR_GROUPS, adjustHex } from "@/lib/utils/color-utils";
import { ColorField } from "@/features/settings/ColorField";
import { ThemeCard } from "@/features/settings/ThemeCard";
import { X, Plus, Search } from "@/components/icons";

function ThemeEditorForm({
  initial,
  onClose,
}: {
  initial?: ThemeDefinition;
  onClose: () => void;
}) {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [name, setName] = useState(initial?.name ?? "");
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const c = initial?.colors;
    return {
      accent: initial?.accent ?? "#f472b6",
      timerColor: initial?.timerColor ?? "#f0f0f0",
      border: c?.border ?? "#333",
      bgPrimary: c?.bgPrimary ?? "#111",
      bgSurface: c?.bgSurface ?? "#222",
      bgElevated: c?.bgElevated ?? "#333",
      bgHover: c?.bgHover ?? "#444",
      bgActive: c?.bgActive ?? "#555",
      textPrimary: c?.textPrimary ?? "#eee",
      textSecondary: c?.textSecondary ?? "#aaa",
      textMuted: c?.textMuted ?? "#777",
    };
  });

  const setColor = useCallback((key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isEditing = !!initial;
  const bgPrimary = colors.bgPrimary ?? "#000";
  const textPrimary = colors.textPrimary ?? "#fff";
  const accent = colors.accent ?? "#f472b6";
  const isDark = parseInt(bgPrimary.replace("#", ""), 16) < 0x808080;

  const handleSave = () => {
    const theme: ThemeDefinition = {
      id: initial?.id ?? `custom-${Date.now()}`,
      name: name || "Untitled",
      description: initial?.description ?? "Custom theme",
      category: initial?.category ?? (isDark ? "dark" : "light"),
      accent: colors.accent ?? "#f472b6",
      timerColor: colors.timerColor ?? "#f0f0f0",
      colors: {
        bgPrimary: colors.bgPrimary ?? "#000",
        bgSurface: colors.bgSurface ?? adjustHex(colors.bgPrimary ?? "#000", 8),
        bgElevated: colors.bgElevated ?? adjustHex(colors.bgPrimary ?? "#000", 16),
        bgHover: colors.bgHover ?? adjustHex(colors.bgPrimary ?? "#000", 24),
        bgActive: colors.bgActive ?? adjustHex(colors.bgPrimary ?? "#000", 32),
        textPrimary: colors.textPrimary ?? "#fff",
        textSecondary: colors.textSecondary ?? adjustHex(colors.textPrimary ?? "#fff", -40),
        textMuted: colors.textMuted ?? adjustHex(colors.textPrimary ?? "#fff", -70),
        border: colors.border ?? adjustHex(colors.bgPrimary ?? "#000", 24),
      },
    };

    if (isEditing && !initial.id.startsWith("custom-")) {
      theme.id = `custom-${Date.now()}`;
      theme.description = `${initial.name} edit`;
    }

    const existingCustoms: ThemeDefinition[] = settings.customThemes || [];
    let updatedCustoms: ThemeDefinition[];

    if (isEditing && initial.id.startsWith("custom-")) {
      updatedCustoms = existingCustoms.map((t) =>
        t.id === initial.id ? theme : t
      );
    } else {
      updatedCustoms = [...existingCustoms, theme];
    }

    unregisterCustomTheme(initial?.id ?? "");
    registerCustomTheme(theme);
    updateSettings({ customThemes: updatedCustoms, theme: theme.id });
    onClose();
  };

  return (
    <div className="rounded-xl border border-border/20 bg-bg-surface/60">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-semibold text-primary">
          {isEditing ? `Edit ${initial.name}` : "Create custom theme"}
        </span>
        <button type="button"
          onClick={onClose}
          className="text-muted hover:text-primary transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="mb-4">
          <label className="text-[11px] text-muted block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Theme"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border/30 text-xs text-primary placeholder:text-muted/40 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        {COLOR_GROUPS.map((group) => (
          <div key={group.key} className="mb-3 last:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-border/20" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">{group.label}</span>
              <div className="h-px flex-1 bg-border/20" />
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {COLOR_FIELDS.filter((f) => f.group === group.key).map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  value={colors[field.key] ?? ""}
                  onChange={(v) => setColor(field.key, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border/10 bg-bg-surface/80 px-4 py-3 flex items-center gap-3">
        <div
          className="flex-1 h-8 rounded-lg flex items-center px-3 gap-2 border border-border/20"
          style={{ backgroundColor: bgPrimary, borderColor: colors.border ?? "transparent" }}
        >
          <span className="text-xs font-semibold" style={{ color: accent }}>Aa</span>
          <span className="text-xs" style={{ color: textPrimary }}>Preview</span>
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: accent }} />
          <div className="h-px flex-1" style={{ backgroundColor: colors.border ?? "transparent" }} />
          <span className="text-[10px]" style={{ color: colors.textSecondary ?? textPrimary }}>
            {isDark ? "Dark" : "Light"}
          </span>
        </div>
        <button type="button"
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 active:scale-95 transition-all shrink-0"
        >
          {isEditing ? "Save" : "Create"}
        </button>
      </div>
    </div>
  );
}

export function ThemesTab() {
  const themeId = useSettingsStore((s) => s.settings.theme);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const customThemes = useSettingsStore((s) => s.settings.customThemes || []);
  const [category, setCategory] = useState<ThemeCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeDefinition | undefined>(undefined);

  const themes = useMemo(() => {
    const all = getAllThemes();
    if (search) return searchThemes(search);
    if (category === "all") return all;
    return all.filter((t) => t.category === category);
  }, [category, search, customThemes]);

  const handleDelete = (id: string) => {
    unregisterCustomTheme(id);
    const filtered = customThemes.filter((t: ThemeDefinition) => t.id !== id);
    updateSettings({ customThemes: filtered });
    if (themeId === id) updateSettings({ theme: "dark" });
  };

  const handleEdit = useCallback(
    (id: string) => {
      const theme = getThemeById(id);
      if (theme) {
        setEditingTheme(theme);
        setEditorOpen(true);
      }
    },
    []
  );

  const handleCreateNew = useCallback(() => {
    setEditingTheme(undefined);
    setEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingTheme(undefined);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Theme</h2>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted/50 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search themes..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-bg-primary/80 border border-border/20 text-xs text-primary placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all"
          />
        </div>
        <button type="button"
          onClick={handleCreateNew}
          className="shrink-0 size-8 flex items-center justify-center rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {editorOpen && <ThemeEditorForm initial={editingTheme} onClose={handleCloseEditor} />}

      <div className="flex items-center gap-1.5 px-1 pb-1 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button type="button"
            key={cat.id}
            onClick={() => { setCategory(cat.id); setSearch(""); }}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              category === cat.id
                ? "bg-accent text-white"
                : "bg-bg-active/50 text-muted hover:text-primary hover:bg-bg-active"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {themes.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-xs text-muted">No themes match your search</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
          {themes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              selected={themeId === t.id}
              onSelect={() => updateSettings({ theme: t.id })}
              onEdit={() => handleEdit(t.id)}
              onDelete={t.id.startsWith("custom-") ? () => handleDelete(t.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
