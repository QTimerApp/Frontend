"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { getThemeById, themeToCssVars } from "@/lib/utils/themes";
import { adjustHex as adjustBrightness } from "@/lib/utils/color-utils";

export function SettingsApplier() {
  const themeId = useSettingsStore((s) => s.settings.theme);
  const rafRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const root = document.documentElement;
      const theme = getThemeById(themeId);
      const vars = themeToCssVars(theme);
      for (const [key, val] of Object.entries(vars)) {
        root.style.setProperty(key, val);
      }
      root.style.setProperty("--accent", theme.accent);
      root.style.setProperty("--accent-hover", adjustBrightness(theme.accent, -20));
      root.style.setProperty("--accent-light", adjustBrightness(theme.accent, 40));
      root.style.setProperty("--timer-color", theme.timerColor);
      root.setAttribute("data-theme", themeId);

      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", theme.colors.bgPrimary);
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [themeId]);

  return null;
}
