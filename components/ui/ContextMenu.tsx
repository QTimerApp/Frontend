"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";

interface ContextMenuProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: { x: number; y: number };
}

export function ContextMenu({
  open,
  onClose,
  children,
  position,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleScroll = () => onClose();
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !menuRef.current) return;
    const menu = menuRef.current;
    const raf = requestAnimationFrame(() => {
      const rect = menu.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      let x = position?.x ?? 0;
      let y = position?.y ?? 0;
      if (x + rect.width > window.innerWidth - 8) {
        x = window.innerWidth - rect.width - 8;
      }
      if (y + rect.height > window.innerHeight - 8) {
        y = window.innerHeight - rect.height - 8;
      }
      setPos({ x: Math.max(8, x), y: Math.max(8, y) });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, position]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            zIndex: 9999,
            minWidth: 180,
          }}
          className="bg-bg-elevated border border-border/20 rounded-lg shadow-2xl overflow-hidden p-1"
          onContextMenu={(e) => e.preventDefault()}
        >
          <Command
            label="Context menu"
            shouldFilter={false}
            loop
          >
            {children}
          </Command>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ContextMenuItem({
  onSelect,
  children,
  icon,
  shortcut,
  danger,
  disabled,
}: {
  onSelect?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Command.Item
      onSelect={() => {
        if (!disabled && onSelect) onSelect();
      }}
      disabled={disabled}
      data-danger={danger ? "true" : undefined}
      className={`group flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm cursor-pointer outline-none rounded-md
        data-[selected=true]:bg-bg-hover/80
        ${danger ? "text-red-400 data-[selected=true]:bg-red-500/15" : "text-primary"}
        ${disabled ? "opacity-40 pointer-events-none" : ""}
      `}
    >
      {icon && (
        <span className="size-3.5 flex items-center justify-center shrink-0 text-muted group-data-[danger=true]:text-red-400/80">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && (
        <span className="text-[10px] text-muted/40 font-mono tracking-wider ml-4">
          {shortcut}
        </span>
      )}
    </Command.Item>
  );
}

export function ContextMenuSeparator() {
  return <Command.Separator className="h-px bg-border/20 mx-2 my-1" />;
}

export function ContextMenuGroup({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <Command.Group
      heading={label}
      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:text-muted/40 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
    >
      {children}
    </Command.Group>
  );
}
