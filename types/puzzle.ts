import type { ReactNode } from "react";

const PUZZLE_EVENTS = [
  "2x2", "3x3", "4x4", "5x5", "6x6", "7x7",
  "Megaminx", "Skewb", "Clock", "Square One", "Pyraminx", "FTO",
] as const;

export type PuzzleEvent = (typeof PUZZLE_EVENTS)[number];
export const DEFAULT_EVENT: PuzzleEvent = "3x3";

export interface PuzzleType {
  name: string;
  icon: () => ReactNode;
}
