"use client";

import { useMemo } from "react";
import { formatMilliseconds } from "@/lib/utils/format";
import { effectiveTime, isDNF, isPlusTwo } from "@/types/penalty";

interface ShareCardSolveData {
  timeMs: number;
  penalty?: string | null;
  scramble?: string;
  eventId?: string;
  createdAt?: string;
}

interface ShareCardAverageData {
  groupSize: number;
  averageValue: string;
  eventId?: string;
  solves: Array<{
    id: string;
    timeMs: number;
    penalty: string | null;
    scramble: string;
  }>;
  createdAt?: string;
}

interface ShareCardProps {
  type: "solve" | "average";
  data: ShareCardSolveData | ShareCardAverageData;
}

function getCssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const QRX = (
  <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#16110d" />
    <rect x="11" y="11" width="12" height="12" rx="2" fill="#A5D6A7" />
    <rect x="25" y="11" width="12" height="12" rx="2" fill="#EF9A9A" />
    <rect x="39" y="11" width="12" height="12" rx="2" fill="#90CAF9" />
    <rect x="11" y="25" width="12" height="12" rx="2" fill="#FFCC80" />
    <rect x="25" y="25" width="12" height="12" rx="2" fill="#FBFBFB" />
    <rect x="39" y="25" width="12" height="12" rx="2" fill="#FFF59D" />
    <rect x="11" y="39" width="12" height="12" rx="2" fill="#CE93D8" />
    <rect x="25" y="39" width="12" height="12" rx="2" fill="#80CBC4" />
    <rect x="39" y="39" width="12" height="12" rx="2" fill="#F48FB1" />
  </svg>
);

const W = 500;
const H = 140;

function SolveCard({ data }: { data: ShareCardSolveData }) {
  const bgPrimary = getCssVar("--bg-primary") || "#080604";
  const bgSurface = getCssVar("--bg-surface") || "#16110d";
  const textPrimary = getCssVar("--text-primary") || "#efe3d4";
  const textSecondary = getCssVar("--text-secondary") || "#b8a99a";
  const textMuted = getCssVar("--text-muted") || "#8a7e72";
  const accent = getCssVar("--accent") || "#f472b6";

  const displayEvent = data.eventId || "3x3";

  const dnff = isDNF(data.penalty);
  const displayTime = dnff
    ? "DNF"
    : formatMilliseconds(
        effectiveTime({ timeMs: data.timeMs, penalty: data.penalty }),
      );
  const plus2 = isPlusTwo(data.penalty) && !dnff;
  const displayMs =
    data.penalty === "+2" ? formatMilliseconds(data.timeMs) : null;

  return (
    <div
      style={{
        width: W,
        height: H,
        boxSizing: "border-box",
        background: `linear-gradient(145deg, ${bgSurface} 0%, ${bgPrimary} 70%, ${hexToRgba(accent, 0.05)} 100%)`,
        borderRadius: 14,
        fontFamily: "'Space Mono', 'SF Mono', ui-monospace, monospace",
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 10% 50%, ${hexToRgba(accent, 0.12)} 0%, ${hexToRgba(bgPrimary, 0.35)} 45%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          flex: 1,
          padding: "14px 14px 12px 18px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            letterSpacing: "0.02em",
            marginBottom: 1,
          }}
        >
          {displayEvent}{" "}
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: accent,
              letterSpacing: "0.04em",
              padding: "1px 5px",
              borderRadius: 4,
              border: `2px solid ${hexToRgba(accent, 0.3)}`,
              lineHeight: 1.3,
            }}
          >
            S
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: textPrimary,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {dnff ? (
              <span
                style={{
                  color: "#ef4444",
                  textDecoration: "line-through",
                  textDecorationColor: hexToRgba("#ef4444", 0.5),
                }}
              >
                DNF
              </span>
            ) : (
              <span>{displayTime}</span>
            )}
          </span>
          {plus2 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fbbf24",
                padding: "1px 6px",
                borderRadius: 4,
                background: hexToRgba("#fbbf24", 0.12),
                border: `1px solid ${hexToRgba("#fbbf24", 0.2)}`,
              }}
            >
              +2
            </span>
          )}
          {displayMs && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: textMuted,
                textDecoration: "line-through",
                textDecorationColor: hexToRgba(textMuted, 0.3),
              }}
            >
              {displayMs}
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 9,
            color: textSecondary,
            lineHeight: 1.5,
            marginBottom: "auto",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {data.scramble || ""}
        </div>

        {data.createdAt && (
          <div style={{ fontSize: 9, color: textMuted, marginTop: 4 }}>
            {new Date(data.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}
      </div>

      <div
        style={{
          width: 100,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div style={{ transform: "scale(2.5)", transformOrigin: "center" }}>
          {QRX}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>
          QTimer
        </span>
      </div>
    </div>
  );
}

function AverageCard({ data }: { data: ShareCardAverageData }) {
  const bgPrimary = getCssVar("--bg-primary") || "#080604";
  const bgSurface = getCssVar("--bg-surface") || "#16110d";
  const textPrimary = getCssVar("--text-primary") || "#efe3d4";
  const textSecondary = getCssVar("--text-secondary") || "#b8a99a";
  const textMuted = getCssVar("--text-muted") || "#8a7e72";
  const accent = getCssVar("--accent") || "#f472b6";
  const border = getCssVar("--border") || "#382e26";

  const displayEvent = data.eventId || "3x3";

  const displayedSolves = useMemo(() => {
    const filtered = data.solves.map((s) => ({
      ...s,
      effective: effectiveTime({ timeMs: s.timeMs, penalty: s.penalty }),
      dnff: isDNF(s.penalty),
    }));
    const valid = filtered.filter((s) => !s.dnff);
    const best = valid.length
      ? Math.min(...valid.map((s) => s.effective))
      : null;
    const worst = valid.length
      ? Math.max(...valid.map((s) => s.effective))
      : null;
    return filtered.map((s) => ({
      ...s,
      isBest: !s.dnff && best !== null && s.effective === best,
      isWorst: !s.dnff && worst !== null && s.effective === worst,
    }));
  }, [data.solves]);

  return (
    <div
      style={{
        width: W,
        height: H,
        boxSizing: "border-box",
        background: `linear-gradient(145deg, ${bgSurface} 0%, ${bgPrimary} 70%, ${hexToRgba(accent, 0.05)} 100%)`,
        borderRadius: 14,
        fontFamily: "'Space Mono', 'SF Mono', ui-monospace, monospace",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 10% 50%, ${hexToRgba(accent, 0.12)} 0%, ${hexToRgba(bgPrimary, 0.35)} 45%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          flex: 1,
          padding: "14px 14px 12px 18px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            letterSpacing: "0.02em",
            marginBottom: 2,
          }}
        >
          {displayEvent}{" "}
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: accent,
              letterSpacing: "0.04em",
              padding: "1px 5px",
              borderRadius: 4,
              border: `2px solid ${hexToRgba(accent, 0.3)}`,
              lineHeight: 1.3,
            }}
          >
            A
          </span>
          <span style={{ fontSize: 9, color: textSecondary, marginLeft: 4 }}>
            Ao{data.groupSize}
          </span>
        </div>

        <span
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: textPrimary,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            marginBottom: 6,
          }}
        >
          {data.averageValue}
        </span>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            marginBottom: "auto",
          }}
        >
          {displayedSolves.slice(0, 6).map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: "2px 6px",
                borderRadius: 5,
                background: s.isBest
                  ? hexToRgba("#10b981", 0.08)
                  : s.isWorst
                    ? hexToRgba("#ef4444", 0.08)
                    : hexToRgba(bgPrimary, 0.6),
                border: `1px solid ${
                  s.isBest
                    ? hexToRgba("#10b981", 0.2)
                    : s.isWorst
                      ? hexToRgba("#ef4444", 0.2)
                      : hexToRgba(border, 0.5)
                }`,
              }}
            >
              <span style={{ fontSize: 8, fontWeight: 600, color: textMuted }}>
                #{i + 1}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: s.dnff ? "#ef4444" : textPrimary,
                  ...(s.dnff ? { textDecoration: "line-through" } : {}),
                }}
              >
                {s.dnff ? "DNF" : formatMilliseconds(s.timeMs)}
              </span>
              {s.isBest && (
                <span
                  style={{
                    fontSize: 6,
                    fontWeight: 700,
                    color: "#10b981",
                    padding: "1px 2px",
                    borderRadius: 2,
                    background: hexToRgba("#10b981", 0.15),
                    border: `1px solid ${hexToRgba("#10b981", 0.3)}`,
                  }}
                >
                  B
                </span>
              )}
              {s.isWorst && (
                <span
                  style={{
                    fontSize: 6,
                    fontWeight: 700,
                    color: "#ef4444",
                    padding: "1px 2px",
                    borderRadius: 2,
                    background: hexToRgba("#ef4444", 0.15),
                    border: `1px solid ${hexToRgba("#ef4444", 0.3)}`,
                  }}
                >
                  W
                </span>
              )}
            </div>
          ))}
        </div>

        {data.createdAt && (
          <div style={{ fontSize: 9, color: textMuted, marginTop: 4 }}>
            {new Date(data.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}
      </div>

      <div
        style={{
          width: 100,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div style={{ transform: "scale(2.5)", transformOrigin: "center" }}>
          {QRX}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>
          QTimer
        </span>
      </div>
    </div>
  );
}

export function ShareCard({ type, data }: ShareCardProps) {
  return type === "solve" ? (
    <SolveCard data={data as ShareCardSolveData} />
  ) : (
    <AverageCard data={data as ShareCardAverageData} />
  );
}

export type { ShareCardSolveData, ShareCardAverageData };
