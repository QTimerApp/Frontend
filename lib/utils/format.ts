import { Time } from "@/types/timer";

export function formatMilliseconds(ms: number): string {
  const pad = (n: number, z = 2) => ("00" + n).slice(-z);
  const hours = pad(Math.floor(ms / Time.hour));
  const minutes = pad(Math.floor((ms % Time.hour) / Time.minute));
  const seconds = pad(Math.floor((ms % Time.minute) / Time.second));
  const millis = pad(Math.floor(ms % Time.second), 3);
  return `${+hours ? hours + ":" : ""}${+minutes || +hours ? minutes + ":" : ""}${seconds}.${millis}`;
}

export function formatMsLabel(ms: number) {
  if (ms >= Time.minute) {
    const m = Math.floor(ms / Time.minute);
    const s = Math.floor((ms % Time.minute) / Time.second);
    return `${m}:${s.toString().padStart(2, "0")}.${Math.floor(ms % Time.second).toString().padStart(3, "0")}`;
  }
  return formatMilliseconds(ms);
}

export function formatTimeSpent(ms: number): string {
  const hours = Math.floor(ms / Time.hour);
  const minutes = Math.floor((ms % Time.hour) / Time.minute);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatScrambleLines(
  scramble: string,
  puzzleType: string | null,
  multiline: boolean,
): string[] | null {
  if (!scramble || !multiline) return null;
  if (puzzleType === "Megaminx") {
    return scramble.split(/(?<=U[']?)\s+/);
  }
  const words = scramble.split(/\s+/);
  const result: string[] = [];
  let line = "";
  for (const w of words) {
    if (line && line.length + w.length + 1 > 45) {
      result.push(line);
      line = w;
    } else {
      line = line ? line + " " + w : w;
    }
  }
  if (line) result.push(line);
  return result.length > 1 ? result : null;
}
