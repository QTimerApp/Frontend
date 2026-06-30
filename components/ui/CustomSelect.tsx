"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

interface Option {
  label: string;
  value: string;
}

export function CustomSelect({
  value,
  options,
  onChange,
  compact,
}: {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 bg-bg-active text-primary rounded-lg border border-border/40 hover:border-border focus:outline-none focus:border-accent/50 transition-colors ${
          compact ? "text-[11px] px-2 py-1 w-full" : "text-sm px-3 py-1.5 min-w-[130px]"
        }`}
      >
        <span className="flex-1 text-left truncate">{selected?.label ?? value}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="size-3.5 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button type="button" aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-40 border-none" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute right-0 mt-1.5 z-50 min-w-full bg-bg-elevated border border-border/40 rounded-lg shadow-lg overflow-hidden"
            >
              {options.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                    opt.value === value
                      ? "text-accent bg-accent/[0.07]"
                      : "text-secondary hover:text-primary hover:bg-bg-hover/40"
                  } ${i > 0 ? "border-t border-border/20" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
