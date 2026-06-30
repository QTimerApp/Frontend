export interface ThemeColors {
  bgPrimary: string;
  bgSurface: string;
  bgElevated: string;
  bgHover: string;
  bgActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
}

export type ThemeCategory = "dark" | "light" | "colorful" | "monochrome" | "nature" | "retro";

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  accent: string;
  timerColor: string;
  colors: ThemeColors;
}
