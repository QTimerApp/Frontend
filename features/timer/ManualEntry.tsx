"use client";

import { useRef, useState, useMemo } from "react";
import { ChevronRight, Info } from "@/components/icons";
import { formatMilliseconds } from "@/lib/utils/format";
import { parseManualTime } from "@/lib/utils/manual-time";
import type { ChangeEvent, KeyboardEvent } from "react";

interface ManualEntryProps {
  onSubmit: (ms: number) => void;
  onPreview: (text: string | null) => void;
}

export function ManualEntry({ onSubmit, onPreview }: ManualEntryProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!value.trim()) return null;
    const ms = parseManualTime(value);
    if (ms === null || ms < 0) return null;
    return formatMilliseconds(ms);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError(null);
  };

  const handleSubmit = () => {
    const val = value.trim();
    if (!val) return;
    const ms = parseManualTime(val);
    if (ms === null || ms < 0) {
      setError("Invalid time");
      return;
    }
    setError(null);
    setValue("");
    inputRef.current?.focus();
    onSubmit(ms);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  onPreview(preview);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSubmit();
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[240px]">
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <label htmlFor="manual-time" className="sr-only">Enter time manually</label>
        <input id="manual-time"
          ref={inputRef}
          type="text"
          inputMode="decimal"
          autoFocus
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter time"
          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary border border-border/30 text-sm text-primary placeholder:text-muted/60 font-mono tracking-wider focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
        />
        <div
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-all duration-200 ${
            value.trim()
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <button type="button"
            onClick={handleSubmit}
            className="size-8 flex items-center justify-center rounded-lg bg-accent text-[var(--accent-text)] hover:bg-accent/90 active:scale-90 transition-all duration-150"
          >
            <ChevronRight className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </form>
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-400/80">
          <Info className="size-3 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
