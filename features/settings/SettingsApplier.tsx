"use client";

import { useLayoutEffect, useRef } from "react";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { getThemeById, themeToCssVars } from "@/lib/utils/themes";
import { adjustHex as adjustBrightness, contrastText } from "@/lib/utils/color-utils";

function applyTheme(themeId: string) {
  const root = document.documentElement;
  const theme = getThemeById(themeId);
  const vars = themeToCssVars(theme);
  const allVars: Record<string, string> = {};
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
    allVars[key] = val;
  }
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-hover", adjustBrightness(theme.accent, -20));
  root.style.setProperty("--accent-light", adjustBrightness(theme.accent, 40));
  root.style.setProperty("--accent-text", contrastText(theme.accent));
  root.style.setProperty("--timer-color", theme.timerColor);
  allVars["--accent"] = theme.accent;
  allVars["--accent-hover"] = adjustBrightness(theme.accent, -20);
  allVars["--accent-light"] = adjustBrightness(theme.accent, 40);
  allVars["--accent-text"] = contrastText(theme.accent);
  allVars["--timer-color"] = theme.timerColor;
  root.setAttribute("data-theme", themeId);

  try { localStorage.setItem("qtimer-theme-vars", JSON.stringify(allVars)); } catch {}

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", theme.colors.bgPrimary);
}

export function SettingsApplier() {
  const themeId = useSettingsStore((s) => s.settings.theme);

  useLayoutEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  return null;
}
