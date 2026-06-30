"use client";

import { generateScramble, DISPLAY_EVENT_MAP } from "@/lib/utils/scramble";
import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useStore } from "@/lib/stores/use";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { formatScrambleLines } from "@/lib/utils/format";
import { RAINBOW } from "@/constants/colors";
import { DEFAULT_EVENT } from "@/types/puzzle";
import { AnimatePresence, motion } from "framer-motion";

function Scramble() {
  const scramble = useStore((s) => s.scramble);
  const setScramble = useStore((s) => s.setScramble);
  const selectedEventId = useStore((s) => s.selectedEventId);
  const multiline = useSettingsStore((s) => s.settings.multiline);
  const rainbowScramble = useSettingsStore((s) => s.settings.rainbowScramble);

  useEffect(() => {
    const puzzle = selectedEventId || DEFAULT_EVENT;
    setScramble(generateScramble(puzzle));
  }, [selectedEventId, setScramble]);

  const lines = useMemo(
    () => formatScrambleLines(scramble ?? "", selectedEventId, multiline),
    [scramble, selectedEventId, multiline],
  );

  const moves = useMemo(
    () => (scramble ?? "").trim().split(/\s+/).filter(Boolean),
    [scramble],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const lineStartIndices = useMemo(() => {
    if (!lines) return [];
    const arr: number[] = [];
    let acc = 0;
    for (const line of lines) {
      arr.push(acc);
      acc += line.split(/\s+/).filter(Boolean).length;
    }
    return arr;
  }, [lines]);

  const handleClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (activeIndex === index) {
        setActiveIndex(null);
      } else {
        setActiveIndex(index);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPopupPos({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8,
        });
      }
    },
    [activeIndex],
  );

  const dismiss = useCallback(() => setActiveIndex(null), []);

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [activeIndex, dismiss]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current?.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest("[data-mi]")) return;
      dismiss();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [activeIndex, dismiss]);

  const partialScramble = useMemo(
    () => (activeIndex !== null ? moves.slice(0, activeIndex + 1).join(" ") : ""),
    [activeIndex, moves],
  );

  const event = DISPLAY_EVENT_MAP[selectedEventId || "3x3"] || "333";

  useEffect(() => {
    if (!previewContainerRef.current || !partialScramble) return;
    previewContainerRef.current.innerHTML = "";
    const el = document.createElement("scramble-display");
    el.setAttribute("event", event);
    el.setAttribute("scramble", partialScramble);
    el.setAttribute("visualization", "2D");
    el.style.width = "160px";
    el.style.height = "107px";
    previewContainerRef.current.appendChild(el);
  }, [partialScramble, event]);

  const renderMoves = (text: string, startIndex: number) => {
    const tokens = text.split(/\s+/).filter(Boolean);
    return tokens.map((move, j) => {
      const idx = startIndex + j;
      return (
        <span key={j}>
          <button
            type="button"
            data-mi={idx}
            className={`inline cursor-pointer rounded-sm px-0.5 -mx-0.5 transition-colors
              ${idx === activeIndex ? "bg-accent/25" : "hover:bg-accent/15 active:bg-accent/25"}`}
            onClick={(e) => handleClick(idx, e)}
          >
            {move}
          </button>
          {j < tokens.length - 1 ? " " : ""}
        </span>
      );
    });
  };

  return (
    <div className="max-w-xl mx-auto w-full px-4 select-none relative">
      <div className="absolute inset-x-4 top-0 h-full bg-linear-to-b from-accent/10 via-accent/2 to-transparent rounded-b-xl pointer-events-none" />
      <div className="relative bg-bg-surface/40 rounded-b-xl p-5 border border-white/4">
        {lines ? (
          <div className="flex flex-col items-center text-sm font-mono leading-relaxed space-y-0.5">
            {lines.map((line, i) => (
              <p
                key={i}
                className="whitespace-nowrap"
                style={rainbowScramble ? { color: RAINBOW[i % RAINBOW.length] } : undefined}
              >
                {renderMoves(line, lineStartIndices[i])}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary font-mono text-center leading-relaxed">
            {renderMoves(scramble ?? "", 0)}
          </p>
        )}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            ref={popupRef}
            className="fixed z-50 pointer-events-auto"
            style={{
              left: Math.max(10, Math.min(popupPos.x, window.innerWidth - 170)),
              top: popupPos.y,
            }}
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div
              className="bg-bg-surface rounded-xl p-3 shadow-2xl border border-white/8"
              style={{ transform: "translateX(-50%)" }}
            >
              <div ref={previewContainerRef} />
              <div className="text-[10px] text-muted/50 text-center mt-1.5 font-mono max-w-40 truncate">
                {moves.slice(0, activeIndex + 1).join(" ")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { Scramble };
