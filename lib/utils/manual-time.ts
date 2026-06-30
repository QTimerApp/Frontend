import { Time } from "@/types/timer";

function parseMsPart(str: string): number {
  const d = str.replace(/[^0-9]/g, "");
  if (!d.length) return 0;
  if (d.length === 1) return parseInt(d, 10) * 100;
  if (d.length === 2) return parseInt(d, 10) * 10;
  return parseInt(d.substring(0, 3), 10);
}

export function parseManualTime(input: string): number | null {
  const s = input.trim().replace(/,/g, ".").replace(/\s/g, "");
  if (!s) return null;

  const hasColon = /[:;]/.test(s);

  if (hasColon) {
    const parts = s
      .split(/[:;]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length < 2 || parts.length > 3) return null;

    let totalSeconds = 0;

    if (parts.length === 3) {
      const h = parseInt(parts[0], 10);
      if (isNaN(h) || h < 0) return null;
      totalSeconds += h * 3600;
      parts.shift();
    }

    const min = parseInt(parts[0], 10);
    if (isNaN(min) || min < 0) return null;
    totalSeconds += min * 60;

    const secPart = parts[1];
    if (secPart.includes(".")) {
      const [secStr, msStr] = secPart.split(".");
      const sec = parseInt(secStr, 10);
      if (isNaN(sec) || sec < 0 || sec >= 60) return null;
      totalSeconds += sec;
      return totalSeconds * Time.second + parseMsPart(msStr);
    }

    if (secPart.length <= 2) {
      const sec = parseInt(secPart, 10);
      if (isNaN(sec) || sec < 0 || sec >= 60) return null;
      totalSeconds += sec;
    } else {
      const sec = parseInt(secPart.substring(0, 2), 10);
      const ms = parseMsPart(secPart.substring(2));
      if (isNaN(sec) || sec < 0 || sec >= 60) return null;
      totalSeconds += sec;
      return totalSeconds * Time.second + ms;
    }

    return totalSeconds * Time.second;
  }

  if (s.includes(".")) {
    const parts = s.split(".");
    if (parts.length !== 2) return null;
    const intPart = parseInt(parts[0], 10);
    const frac = parseMsPart(parts[1]);
    if (isNaN(intPart) || intPart < 0) return null;
    return intPart * Time.second + frac;
  }

  const digits = s.replace(/[^0-9]/g, "");
  if (!digits.length) return null;

  if (digits.length <= 2) {
    return parseInt(digits.padEnd(2, "0"), 10) * 10;
  }

  if (digits.length === 3) {
    return parseInt(digits[0], 10) * Time.second + parseInt(digits.slice(1), 10) * 10;
  }

  if (digits.length === 4) {
    return (
      parseInt(digits.slice(0, 2), 10) * Time.second +
      parseInt(digits.slice(2), 10) * 10
    );
  }

  const min = parseInt(digits.slice(0, digits.length - 4), 10);
  const sec = parseInt(digits.slice(digits.length - 4, digits.length - 2), 10);
  const hund = parseInt(digits.slice(digits.length - 2), 10);
  if (isNaN(min) || isNaN(sec) || sec >= 60) return null;
  return (min * 60 + sec) * Time.second + hund * 10;
}
