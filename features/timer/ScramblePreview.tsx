"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/stores/use";
import { DISPLAY_EVENT_MAP } from "@/lib/utils/scramble";
import "scramble-display";

function createScrambleEl(event: string, scramble: string, width: string, height: string) {
  const el = document.createElement("scramble-display");
  el.setAttribute("event", event);
  el.setAttribute("scramble", scramble || "");
  el.setAttribute("visualization", "2D");
  el.style.width = width;
  el.style.height = height;
  return el;
}

function ScramblePreview() {
  const scramble = useStore((s) => s.scramble);
  const selectedEventId = useStore((s) => s.selectedEventId);
  const event = DISPLAY_EVENT_MAP[selectedEventId || "3x3"] || "333";
  const containerRef = useRef<HTMLDivElement>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    container.appendChild(createScrambleEl(event, scramble, "120px", "80px"));
  }, [event, scramble]);

  useEffect(() => {
    const container = popupContainerRef.current;
    if (!container || !open) return;
    container.innerHTML = "";
    container.appendChild(createScrambleEl(event, scramble, "420px", "280px"));
  }, [event, scramble, open]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <>
      <button type="button"
        aria-label="Open scramble preview"
        className="select-none cursor-pointer bg-transparent border-none p-0"
        onClick={() => setOpen(true)}
      >
        <div ref={containerRef} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.button type="button" aria-hidden="true" tabIndex={-1}
              className="rounded-xl bg-bg-surface p-4 shadow-2xl border-none"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div ref={popupContainerRef} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ScramblePreview;
