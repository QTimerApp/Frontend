import { hexToHsl, lightnessToSliderValue } from "@dayflow/blossom-color-picker";
import type { BlossomColorPickerValue } from "@dayflow/blossom-color-picker-react";

export function hexToBlossomValue(hex: string): BlossomColorPickerValue {
  const { h, s, l } = hexToHsl(hex);
  return {
    hue: h,
    saturation: lightnessToSliderValue(l),
    alpha: 100,
    layer: "outer",
  };
}

export function adjustHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function hexLuminance(hex: string): number {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastText(bg: string): string {
  return hexLuminance(bg) > 0.5 ? "#000000" : "#ffffff";
}

export { adjustHex as adjustBrightness };

export const COLOR_FIELDS = [
  { key: "accent", label: "Accent", group: "accent" },
  { key: "timerColor", label: "Timer", group: "accent" },
  { key: "border", label: "Border", group: "accent" },
  { key: "bgPrimary", label: "Primary", group: "backgrounds" },
  { key: "bgSurface", label: "Surface", group: "backgrounds" },
  { key: "bgElevated", label: "Elevated", group: "backgrounds" },
  { key: "bgHover", label: "Hover", group: "backgrounds" },
  { key: "bgActive", label: "Active", group: "backgrounds" },
  { key: "textPrimary", label: "Primary", group: "text" },
  { key: "textSecondary", label: "Secondary", group: "text" },
  { key: "textMuted", label: "Muted", group: "text" },
] as const;

export const COLOR_GROUPS = [
  { key: "accent", label: "Accent & Borders" },
  { key: "backgrounds", label: "Backgrounds" },
  { key: "text", label: "Text" },
] as const;
