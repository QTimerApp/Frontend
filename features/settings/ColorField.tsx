"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BlossomColorPicker } from "@dayflow/blossom-color-picker-react";
import type { BlossomColorPickerColor } from "@dayflow/blossom-color-picker-react";
import { hexToBlossomValue } from "@/lib/utils/color-utils";

const HEX_REGEX = /^#[0-9a-fA-F]{0,6}$/;

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);

  const handlePickerChange = useCallback(
    (c: BlossomColorPickerColor) => {
      const hex = c.hex.toLowerCase();
      setDraft(hex);
      onChange(hex);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (!raw.startsWith("#")) {
        setDraft("#" + raw.replace(/^#+/, ""));
        return;
      }
      setDraft(raw);
    },
    []
  );

  const handleInputBlur = useCallback(() => {
    setFocused(false);
    if (HEX_REGEX.test(draft) && draft.length === 7) {
      onChange(draft.toLowerCase());
    } else {
      setDraft(value);
    }
  }, [draft, value, onChange]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const blossomValue = hexToBlossomValue(value);

  return (
    <div className="flex items-center gap-2 group">
      <div className="relative shrink-0 rounded-full border border-border/20 bg-bg-primary/30 flex items-center justify-center"
        style={{ width: 28, height: 28 }}
      >
        <BlossomColorPicker
          value={blossomValue}
          onChange={handlePickerChange}
          coreSize={22}
          petalSize={20}
          showAlphaSlider={false}
          showCoreColor
          initialExpanded={false}
          animationDuration={200}
          className="[&_*]:outline-none"
        />
      </div>
      <label className="text-[11px] text-muted min-w-[52px]">{label}</label>
      <input
        value={draft}
        onChange={handleInputChange}
        onFocus={() => setFocused(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        placeholder="#000000"
        maxLength={7}
        spellCheck={false}
        className="flex-1 min-w-0 px-2 py-1 rounded-md bg-bg-primary border border-border/30 font-mono text-[11px] text-primary placeholder:text-muted/30 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
      />
      <div
        className="shrink-0 size-4 rounded border border-border/30 shadow-xs"
        style={{ backgroundColor: value }}
      />
    </div>
  );
}
