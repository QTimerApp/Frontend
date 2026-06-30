"use client";

import { motion } from "framer-motion";
import { memo } from "react";

export const Toggle = memo(function Toggle({
  value,
  onChange,
  id,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={value}
      onClick={() => { if (!disabled) onChange(!value); }}
      className={`relative flex items-center w-11 h-6 rounded-full shrink-0 group ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <motion.span
        animate={{ backgroundColor: value ? "var(--accent)" : "var(--bg-active)" }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 rounded-full"
      />
      {value && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute inset-0 rounded-full blur-[5px]"
          style={{ backgroundColor: "var(--accent)" }}
        />
      )}
      <motion.span
        animate={{ x: value ? 22 : 2 }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 600, damping: 26 }}
        className="relative flex items-center justify-center size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
      >
        {value && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="w-[10px] h-[10px]"
            style={{ color: "var(--accent)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </motion.span>
    </button>
  );
});
