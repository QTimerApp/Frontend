import cstimer from "cstimer_module";

const SCRAMBLE_EVENT_MAP: Record<string, { type: string; length?: number }> = {
  "2x2": { type: "222so" },
  "3x3": { type: "333" },
  "4x4": { type: "444wca" },
  "5x5": { type: "555wca", length: 60 },
  "6x6": { type: "666wca", length: 80 },
  "7x7": { type: "777wca", length: 100 },
  Megaminx: { type: "mgmp", length: 70 },
  Pyraminx: { type: "pyrso", length: 10 },
  Skewb: { type: "skbso" },
  Clock: { type: "clkwca" },
  "Square One": { type: "sqrs" },
  FTO: { type: "ftoso" },
};

export const DISPLAY_EVENT_MAP: Record<string, string> = {
  "2x2": "222",
  "3x3": "333",
  "4x4": "444",
  "5x5": "555",
  "6x6": "666",
  "7x7": "777",
  Megaminx: "minx",
  Pyraminx: "pyram",
  Skewb: "skewb",
  Clock: "clock",
  "Square One": "sq1",
  FTO: "fto",
};

export function generateScramble(puzzle: string): string {
  const config = SCRAMBLE_EVENT_MAP[puzzle] || { type: "333" };
  return cstimer.getScramble(config.type, config.length ?? 0).trim();
}
