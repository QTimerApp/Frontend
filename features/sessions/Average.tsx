"use client";

import { useState, useCallback } from "react";
import { computeAo } from "@/lib/utils/stats";
import { motion } from "framer-motion";
import { Time } from "@/types/timer";
import { X, ChevronDown, Copy, Trash, Share as ShareIcon } from "@/components/icons";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import type { Solve } from "@/types/solve";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";

export function Average({
  solves,
  index,
  groupSize,
  collapsed,
  onToggle,
  onDelete,
  onClick,
  eventId,
}: {
  solves: Solve[];
  index: number;
  groupSize: number;
  collapsed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onClick?: () => void;
  eventId?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const { openModal } = useModal();
  const averageTime = computeAo(solves, groupSize);
  if (!averageTime) return null;

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }, []);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  }, [onDelete]);

  const handleContextDelete = useCallback(() => {
    onDelete();
    setMenuOpen(false);
  }, [onDelete]);

  const handleClose = useCallback(() => setMenuOpen(false), []);

  const handleShare = useCallback(() => {
    openModal(ModalType.Share, {
      shareType: "average",
      shareAverageData: {
        groupSize,
        averageValue: averageTime ?? "—",
        solves: solves.map((s) => ({
          id: s.id,
          timeMs: s.timeMs,
          penalty: s.penalty ?? null,
          scramble: s.scramble,
        })),
        eventId,
        createdAt: solves[0]?.createdAt ?? undefined,
      },
    });
    setMenuOpen(false);
  }, [openModal, solves, groupSize, averageTime, eventId]);

  const copyTimes = useCallback(async () => {
    try {
      const times = solves
        .map((s) => {
          const ms =
            s.penalty === "DNF"
              ? "DNF"
              : s.penalty === "+2"
                ? `${((s.timeMs + Time.second * 2) / Time.second).toFixed(2)}+`
                : (s.timeMs / Time.second).toFixed(2);
          return ms;
        })
        .join(", ");
      await navigator.clipboard.writeText(times);
    } catch {}
    setMenuOpen(false);
  }, [solves]);

  return (
    <>
      <motion.div
        layout
        className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-bg-elevated/60 group"
        onContextMenu={handleContextMenu}
      >
        <button type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand average" : "Collapse average"}
          className="bg-transparent border-none p-0 cursor-pointer"
        >
          <ChevronDown
            className={`size-3 text-muted transition-transform duration-150 shrink-0 ${
              collapsed ? "-rotate-90" : ""
            }`}
          />
        </button>
        <span className="text-xs font-semibold text-secondary shrink-0">
          Ao{groupSize}
        </span>
        <button type="button"
          className="text-xs font-medium tabular-nums text-primary flex-1 cursor-pointer hover:text-accent transition-colors bg-transparent border-none text-left p-0"
          onClick={onClick}
        >
          {averageTime}
        </button>
        <button type="button"
          onClick={handleDeleteClick}
          className="text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent cursor-pointer border-none bg-transparent p-0"
          aria-label="Delete average"
        >
          <X className="size-3.5" />
        </button>
      </motion.div>

      <ContextMenu open={menuOpen} onClose={handleClose} position={menuPos}>
        <ContextMenuItem
          icon={<ChevronDown className="size-3.5" />}
          onSelect={() => {
            onToggle();
            setMenuOpen(false);
          }}
        >
          {collapsed ? "Expand" : "Collapse"}
        </ContextMenuItem>
        <ContextMenuItem
          icon={<Copy className="size-3.5" />}
          onSelect={copyTimes}
        >
          Copy Times
        </ContextMenuItem>
        <ContextMenuItem
          icon={<ShareIcon className="size-3.5" />}
          onSelect={handleShare}
        >
          Share
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<Trash className="size-3.5" />}
          onSelect={handleContextDelete}
          danger
        >
          Delete Average
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}
