"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandSeparator,
} from "cmdk";
import { useStore } from "@/lib/stores/use";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { useSettingsStore } from "@/lib/stores/useSettings";
import type { Settings } from "@/types/settings";
import { getAllThemes } from "@/lib/utils/themes";
import { db } from "@/lib/db";
import { Search, Check, Clock, Gear, Plus, Stats, User, Bell, Layers, Copy } from "@/components/icons";

type BoolKeys = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never;
}[keyof Settings];

interface BoolSetting {
  key: BoolKeys;
  label: string;
  group: string;
  keywords: string[];
}

const CATEGORIES: { id: string; label: string; icon: string }[] = [
  {
    id: "general",
    label: "General",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    id: "timer",
    label: "Timer",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "scramble",
    label: "Scramble",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  },
  {
    id: "session",
    label: "Session",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

const BOOLEAN_SETTINGS: BoolSetting[] = [
  {
    key: "showStatsPanel",
    label: "Stats panel",
    group: "general",
    keywords: ["statistics", "stats panel", "show stats"],
  },
  {
    key: "hideTimeDuringSolve",
    label: "Hide time during solve",
    group: "general",
    keywords: ["blind", "hide time", "hidden"],
  },
  {
    key: "soundEnabled",
    label: "Sound effects",
    group: "timer",
    keywords: ["sound", "beep", "audio", "timer beep"],
  },
  {
    key: "manualEntry",
    label: "Manual time entry",
    group: "timer",
    keywords: ["manual", "type time", "input"],
  },
  {
    key: "autoStart",
    label: "Auto-start timer",
    group: "timer",
    keywords: ["auto start", "autostart", "automatic"],
  },
  {
    key: "showScrambleImage",
    label: "2D scramble preview",
    group: "scramble",
    keywords: ["scramble image", "preview", "2d"],
  },
  {
    key: "multiline",
    label: "Multi-line scrambles",
    group: "scramble",
    keywords: ["multiline", "multi line", "wrap"],
  },
  {
    key: "rainbowScramble",
    label: "Rainbow scramble lines",
    group: "scramble",
    keywords: ["rainbow", "color lines"],
  },
  {
    key: "rainbowSolves",
    label: "Rainbow solve list",
    group: "session",
    keywords: ["rainbow", "color solves", "colorful"],
  },
  {
    key: "confirmDelete",
    label: "Confirm before deleting",
    group: "session",
    keywords: ["confirm delete", "delete confirmation"],
  },
  {
    key: "autoCollapseAverages",
    label: "Auto-collapse averages",
    group: "session",
    keywords: ["collapse averages", "auto collapse"],
  },
  {
    key: "displayStatAo5",
    label: "Show Ao5",
    group: "statistics",
    keywords: ["average of 5", "ao5"],
  },
  {
    key: "displayStatAo12",
    label: "Show Ao12",
    group: "statistics",
    keywords: ["average of 12", "ao12"],
  },
  {
    key: "displayStatAo50",
    label: "Show Ao50",
    group: "statistics",
    keywords: ["average of 50", "ao50"],
  },
  {
    key: "displayStatAo100",
    label: "Show Ao100",
    group: "statistics",
    keywords: ["average of 100", "ao100"],
  },
];

function ToggleSwitch({ checked }: { checked: boolean }) {
  return (
    <span
      className={`relative inline-flex items-center shrink-0 w-8 h-4.5 rounded-full transition-colors duration-200 ${
        checked ? "bg-accent" : "bg-bg-active"
      }`}
    >
      <span
        className={`inline-block size-3.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-transform duration-200 ${
          checked ? "translate-x-4.25" : "translate-x-0.5"
        }`}
      >
        {checked && <Check className="size-full p-px text-accent" />}
      </span>
    </span>
  );
}

function ItemIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="size-4 shrink-0 flex items-center justify-center text-muted">
      {children}
    </span>
  );
}

function QuickActionIcon({ label, className }: { label: string; className?: string }) {
  switch (label) {
    case "Timer": return <Clock className={className} />;
    case "Stats": return <Stats className={className} />;
    case "New Session": return <Plus className={className} />;
    case "Settings": return <Gear className={className} />;
    default: return null;
  }
}

function NavIcon({ label, className }: { label: string; className?: string }) {
  switch (label) {
    case "Social": return <User className={className} />;
    case "Achievements": return <Bell className={className} />;
    case "Profile": return <User className={className} />;
    default: return null;
  }
}

function CategoryIcon({ catId, className }: { catId: string; className?: string }) {
  switch (catId) {
    case "general": return <Gear className={className} />;
    case "timer": return <Clock className={className} />;
    case "scramble": return <Layers className={className} />;
    case "session": return <Copy className={className} />;
    case "statistics": return <Stats className={className} />;
    default: return null;
  }
}

export function CommandPalette() {
  const router = useRouter();
  const open = useStore((s) => s.commandPaletteOpen);
  const setOpen = useStore((s) => s.setCommandPaletteOpen);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const { openModal } = useModal();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const themes = getAllThemes();
  const sessions = useLiveQuery(() => db.sessions.toArray());

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const run = useCallback(
    (action: () => void) => {
      setOpen(false);
      action();
    },
    [setOpen],
  );

  const toggleSetting = useCallback(
    (key: BoolKeys) => {
      updateSettings({ [key]: !settings[key] } as unknown as Partial<Settings>);
    },
    [settings, updateSettings],
  );

  const getMultiValue = (label: string): string => {
    switch (label) {
      case "Inspection time":
        return settings.inspection === "off" ? "Off" : "15s";
      case "Timer activation":
        return (
          settings.timerActivation.charAt(0).toUpperCase() +
          settings.timerActivation.slice(1)
        );
      case "Start delay":
        return settings.startDelay === "off"
          ? "Off"
          : `${settings.startDelay}ms`;
      case "Scramble preview size":
        return (
          settings.scrambleImageSize.charAt(0).toUpperCase() +
          settings.scrambleImageSize.slice(1)
        );
      case "Solve group size":
        return settings.solvesGroupSize === "off"
          ? "Off"
          : `Ao${settings.solvesGroupSize}`;
      default:
        return "";
    }
  };

  const MULTI_VALUE_SETTINGS = [
    {
      label: "Inspection time",
      keywords: ["inspection", "wca", "15 seconds", "countdown"],
      value: getMultiValue("Inspection time"),
    },
    {
      label: "Timer activation",
      keywords: ["spacebar", "click", "tap", "start"],
      value: getMultiValue("Timer activation"),
    },
    {
      label: "Start delay",
      keywords: ["delay", "start delay"],
      value: getMultiValue("Start delay"),
    },
    {
      label: "Scramble preview size",
      keywords: ["scramble size", "preview size"],
      value: getMultiValue("Scramble preview size"),
    },
    {
      label: "Session prefix",
      keywords: ["session name", "default prefix"],
      value: getMultiValue("Session prefix"),
    },
    {
      label: "Solve group size",
      keywords: ["group size", "average size", "ao"],
      value: getMultiValue("Solve group size"),
    },
  ];

  const boolByGroup = (g: string) =>
    BOOLEAN_SETTINGS.filter((s) => s.group === g);
  const multiByGroup = (g: string) =>
    MULTI_VALUE_SETTINGS.filter((s) =>
      g === "session"
        ? s.label.startsWith("Session") || s.label.startsWith("Solve")
        : g === "timer"
          ? s.label === "Inspection time" ||
            s.label === "Timer activation" ||
            s.label === "Start delay"
          : g === "scramble"
            ? s.label === "Scramble preview size"
            : false,
    );
  const multiForGroup = (g: string) => {
    if (g === "timer")
      return MULTI_VALUE_SETTINGS.filter((s) =>
        ["Inspection time", "Timer activation", "Start delay"].includes(
          s.label,
        ),
      );
    if (g === "scramble")
      return MULTI_VALUE_SETTINGS.filter(
        (s) => s.label === "Scramble preview size",
      );
    if (g === "session")
      return MULTI_VALUE_SETTINGS.filter((s) =>
        ["Session prefix", "Solve group size"].includes(s.label),
      );
    return [];
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="bg-black/60 backdrop-blur-sm fixed inset-0 z-50"
      contentClassName="fixed top-[12%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl rounded-2xl border border-border/30 bg-bg-elevated shadow-2xl overflow-hidden data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=closed]:scale-95 transition-all duration-150"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted/40 pointer-events-none" />
        <CommandInput
          placeholder="Search commands, settings, themes, sessions..."
          className="w-full h-12 pl-10 pr-4 bg-transparent border-none text-sm text-primary placeholder:text-muted/30 focus:outline-none"
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted/30 border border-border/10 rounded px-1.5 py-0.5 pointer-events-none">
          ⌘K
        </kbd>
      </div>
      <CommandList className="max-h-105 overflow-y-auto px-2 pb-3">
        <CommandEmpty className="flex flex-col items-center justify-center py-10 gap-2">
          <Search className="size-8 text-muted/20" />
          <span className="text-xs text-muted/40">No results found</span>
        </CommandEmpty>

        <CommandGroup heading="Quick actions">
          <div className="grid grid-cols-4 gap-1.5 px-0 pb-1">
            {[
              {
                label: "Timer",
                action: () => router.push("/"),
                desc: "Go home",
              },
              {
                label: "Stats",
                action: () => router.push("/stats"),
                desc: "Global stats",
              },
              {
                label: "New Session",
                action: () => openModal(ModalType.AddSession),
                desc: "Create",
              },
              {
                label: "Settings",
                action: () => setSettingsOpen(true),
                desc: "Preferences",
              },
            ].map((item) => (
              <button type="button"
                key={item.label}
                onClick={() => run(item.action)}
                className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg bg-bg-surface/40 border border-border/15 text-xs text-secondary hover:text-primary hover:bg-bg-hover/40 hover:border-border/30 transition-all text-center cursor-pointer"
              >
                <QuickActionIcon label={item.label} className="size-4 text-muted" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </CommandGroup>

        <CommandSeparator
          alwaysRender
          className="h-px bg-border/20 mx-1 my-1"
        />

        <CommandGroup heading="Navigate">
          {[
            {
              label: "Social",
              action: () => router.push("/social"),
            },
            {
              label: "Profile",
              action: () => router.push("/profile"),
            },
          ].map((item) => (
            <CommandItem
              key={item.label}
              value={item.label}
              onSelect={() => run(item.action)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-secondary cursor-pointer data-[selected=true]:bg-bg-hover/50 data-[selected=true]:text-primary transition-colors"
            >
              <ItemIcon>
                <NavIcon label={item.label} className="size-4" />
              </ItemIcon>
              <span className="flex-1">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator
          alwaysRender
          className="h-px bg-border/20 mx-1 my-1"
        />

        <CommandGroup heading="Sessions">
          {sessions && sessions.length > 0 ? (
            sessions.map((s) => (
              <CommandItem
                key={s.id}
                value={`Session ${s.name} ${s.eventId}`}
                keywords={[s.eventId, "go to session", "navigate"]}
                onSelect={() => run(() => router.push(`/session/${s.id}`))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-secondary cursor-pointer data-[selected=true]:bg-bg-hover/50 data-[selected=true]:text-primary transition-colors"
              >
                <ItemIcon>
                  <Clock className="size-4" />
                </ItemIcon>
                <span className="flex-1 truncate">{s.name}</span>
                <span className="text-[10px] text-muted/50 font-mono shrink-0">
                  {s.eventId}
                </span>
              </CommandItem>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-muted/40">
              No sessions yet
            </div>
          )}
        </CommandGroup>

        <CommandSeparator
          alwaysRender
          className="h-px bg-border/20 mx-1 my-1"
        />

        {CATEGORIES.map((cat) => {
          const bools = boolByGroup(cat.id);
          const multis = multiForGroup(cat.id);
          if (bools.length === 0 && multis.length === 0) return null;
          return (
            <CommandGroup key={cat.id} heading={cat.label}>
              {bools.map((s) => (
                <CommandItem
                  key={s.key}
                  value={s.label}
                  keywords={s.keywords}
                  onSelect={() => run(() => toggleSetting(s.key))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-secondary cursor-pointer data-[selected=true]:bg-bg-hover/50 data-[selected=true]:text-primary transition-colors"
                >
                  <ItemIcon>
                    <CategoryIcon catId={cat.id} className="size-4" />
                  </ItemIcon>
                  <span className="flex-1">{s.label}</span>
                  <ToggleSwitch checked={settings[s.key]} />
                </CommandItem>
              ))}
              {bools.length > 0 && multis.length > 0 && (
                <div className="h-px bg-border/10 mx-3 my-1" />
              )}
              {multis.map((s) => (
                <CommandItem
                  key={s.label}
                  value={s.label}
                  keywords={s.keywords}
                  onSelect={() => run(() => setSettingsOpen(true))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-secondary cursor-pointer data-[selected=true]:bg-bg-hover/50 data-[selected=true]:text-primary transition-colors"
                >
                  <ItemIcon>
                    <CategoryIcon catId={cat.id} className="size-4" />
                  </ItemIcon>
                  <span className="flex-1">{s.label}</span>
                  <span className="text-[10px] text-muted/50 font-mono">
                    {s.value}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        <CommandSeparator
          alwaysRender
          className="h-px bg-border/20 mx-1 my-1"
        />

        <CommandGroup heading="Themes">
          {themes.map((t) => (
            <CommandItem
              key={t.id}
              value={`Theme ${t.name} ${t.category} ${t.description}`}
              keywords={[
                t.category,
                t.description,
                "switch theme",
                "change theme",
              ]}
              onSelect={() => run(() => updateSettings({ theme: t.id }))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-secondary cursor-pointer data-[selected=true]:bg-bg-hover/50 data-[selected=true]:text-primary transition-colors"
            >
              <div
                className="size-4 rounded-full border border-border/20 shrink-0"
                style={{ backgroundColor: t.accent }}
              />
              <span className="flex-1">{t.name}</span>
              {settings.theme === t.id && (
                <Check className="size-3.5 text-accent shrink-0" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
