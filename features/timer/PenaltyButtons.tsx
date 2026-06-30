"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, X, Note, Trash } from "@/components/icons";

const HOLD_DURATION = 2000;

interface PenaltyButtonsProps {
  onPlus2: () => void;
  onDNF: () => void;
  onNote: () => void;
  onDelete: () => void;
}

export function PenaltyButtons({ onPlus2, onDNF, onNote, onDelete }: PenaltyButtonsProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartRef = useRef(0);
  const rafRef = useRef<number>(0);
  const firedRef = useRef(false);

  const cancelHold = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setHoldProgress(0);
    firedRef.current = false;
  }, []);

  const startHold = useCallback(() => {
    firedRef.current = false;
    holdStartRef.current = performance.now();
    setHoldProgress(0);

    const tick = (now: number) => {
      if (firedRef.current) return;
      const elapsed = now - holdStartRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        firedRef.current = true;
        setHoldProgress(0);
        onDelete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [onDelete]);

  return (
    <div className="flex items-center gap-2">
      <button type="button"
        onClick={onPlus2}
        aria-label="Add 2-second penalty"
        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500/8 text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/15 transition-all active:scale-95"
      >
        <Plus className="size-3" />
        +2
      </button>
      <button type="button"
        onClick={onDNF}
        aria-label="Mark solve as Did Not Finish"
        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500/8 text-red-400/80 hover:text-red-400 hover:bg-red-500/15 transition-all active:scale-95"
      >
        <X className="size-3" />
        DNF
      </button>
      <button type="button"
        onClick={onNote}
        aria-label="Add note"
        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-bg-active text-muted/70 hover:text-primary hover:bg-bg-elevated/30 transition-all active:scale-95"
      >
        <Note className="size-3" />
        Note
      </button>
      <span className="w-px h-4 bg-border/20" />
      <button type="button"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        aria-label="Hold to delete solve"
        className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none bg-bg-active text-muted/50 hover:text-red-400"
      >
        <div
          className="absolute inset-0 rounded-md bg-red-500/15 transition-none pointer-events-none"
          style={{ width: `${holdProgress * 100}%` }}
        />
        <span className="relative z-10 flex items-center gap-1.5">
          <Trash className="size-3" />
          {holdProgress > 0 ? "Holding..." : "Delete"}
        </span>
      </button>
    </div>
  );
}
