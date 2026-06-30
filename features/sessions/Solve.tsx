"use client";

import { useState, useCallback } from "react";
import { formatMilliseconds } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { X, Plus, DNF, Note, Copy, Trash, Share as ShareIcon } from "@/components/icons";
import { RAINBOW } from "@/constants/colors";
import {
  isDNF,
  isPlusTwo,
  effectiveTimeMs,
  Penalty,
} from "@/types/penalty";
import type { Solve as SolveType } from "@/types/solve";
import { solveService } from "@/lib/services/solve";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import type { ShareCardSolveData } from "@/components/ShareCard";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";

function solveDisplay(
  solve: SolveType
): { text: string; isDNF: boolean } {
  if (isDNF(solve.penalty ?? null))
    return { text: "DNF", isDNF: true };
  return {
    text: formatMilliseconds(
      effectiveTimeMs(solve.timeMs, solve.penalty ?? null)
    ),
    isDNF: false,
  };
}

export function Solve({
  index,
  solve,
  onDelete,
  onSelect,
  eventId,
}: {
  index: number;
  solve: SolveType;
  onDelete: () => void;
  onSelect: (solve: SolveType, index: number) => void;
  eventId?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const { openModal } = useModal();
  const color = RAINBOW[index % RAINBOW.length];
  const { text, isDNF: dnf } = solveDisplay(solve);
  const hasPlusTwo = isPlusTwo(solve.penalty ?? null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }, []);

  const handleClose = useCallback(() => setMenuOpen(false), []);

  const togglePlusTwo = useCallback(async () => {
    const newPenalty =
      solve.penalty === Penalty.PlusTwo ? null : Penalty.PlusTwo;
    await solveService.updateSolvePenalty(solve.id, newPenalty);
    setMenuOpen(false);
  }, [solve.id, solve.penalty]);

  const toggleDNF = useCallback(async () => {
    const newPenalty =
      solve.penalty === Penalty.DNF ? null : Penalty.DNF;
    await solveService.updateSolvePenalty(solve.id, newPenalty);
    setMenuOpen(false);
  }, [solve.id, solve.penalty]);

  const copyTime = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    setMenuOpen(false);
  }, [text]);

  const handleNote = useCallback(() => {
    onSelect(solve, index);
    setMenuOpen(false);
  }, [solve, index, onSelect]);

  const handleDelete = useCallback(() => {
    onDelete();
    setMenuOpen(false);
  }, [onDelete]);

  const handleShare = useCallback(() => {
    openModal(ModalType.Share, {
      shareType: "solve",
      shareSolveData: {
        timeMs: solve.timeMs,
        penalty: solve.penalty ?? null,
        scramble: solve.scramble,
        eventId,
      } as ShareCardSolveData,
    });
    setMenuOpen(false);
  }, [openModal, solve, eventId]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-2 pl-7 pr-2 py-1 rounded-sm hover:cursor-pointer hover:bg-bg-hover/50 group"
        onClick={() => onSelect(solve, index)}
        onContextMenu={handleContextMenu}
      >
        <div
          className="w-0.5 h-5 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>
          {(index + 1).toString().padStart(2, "0")}
        </span>
        <span
          className={`text-xs font-medium tabular-nums flex-1 ${
            dnf
              ? "text-red-400 line-through"
              : hasPlusTwo
                ? "text-primary"
                : "text-primary"
          }`}
        >
          {text}
        </span>
        {hasPlusTwo && (
          <span className="text-[10px] font-bold text-amber-400/70">+2</span>
        )}
        <button type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(solve, index);
          }}
          className={`transition-opacity hover:text-accent cursor-pointer ${
            solve.notes
              ? "text-accent/50 opacity-100 hover:opacity-100"
              : "text-muted opacity-0 group-hover:opacity-100"
          }`}
          aria-label={solve.notes ? "Edit note" : "Add note"}
        >
          <Note
            className="size-3"
            fill={solve.notes ? "currentColor" : "none"}
          />
        </button>
        <button type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent cursor-pointer border-none bg-transparent p-0"
          aria-label="Share solve"
        >
          <ShareIcon className="size-3.5" />
        </button>
        <button type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent cursor-pointer border-none bg-transparent p-0"
          aria-label="Delete solve"
        >
        <X className="size-3.5" />
      </button>
      </motion.div>

      <ContextMenu open={menuOpen} onClose={handleClose} position={menuPos}>
        <ContextMenuItem
          icon={<Plus className="size-3.5" />}
          onSelect={togglePlusTwo}
        >
          {hasPlusTwo ? "Remove +2" : "Add +2"}
        </ContextMenuItem>
        <ContextMenuItem
          icon={<DNF className="size-3.5" />}
          onSelect={toggleDNF}
          danger={!dnf}
        >
          {dnf ? "Remove DNF" : "Mark DNF"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<Note className="size-3.5" />}
          onSelect={handleNote}
        >
          Note
        </ContextMenuItem>
        <ContextMenuItem
          icon={<Copy className="size-3.5" />}
          shortcut="⌘C"
          onSelect={copyTime}
        >
          Copy Time
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
          onSelect={handleDelete}
          danger
        >
          Delete
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}
