"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { X, Calendar, Copy, Check, Clock, DNF as DNFIcon, Share as ShareIcon } from "@/components/icons";
import { formatMilliseconds, formatScrambleLines } from "@/lib/utils/format";
import { isDNF, isPlusTwo, effectiveTime } from "@/types/penalty";
import { RAINBOW } from "@/constants/colors";
import { solveService } from "@/lib/services/solve";
import type { ShareCardSolveData } from "@/components/ShareCard";

export function SolveModal() {
  const { activeModal, closeModal, openModal, modalData } = useModal();
  const { solveIndex, solveTime, solveScramble, solvePenalty, solveCreatedAt, solveEventId, solveId, solveNotes, solveSplits } =
    modalData;
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(solveNotes ?? "");
  const [saved, setSaved] = useState(true);
  const multiline = useSettingsStore((s) => s.settings.multiline);
  const rainbowScramble = useSettingsStore((s) => s.settings.rainbowScramble);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(solveNotes ?? "");
    setSaved(true);
  }, [solveNotes, activeModal]);

  const penalty = solvePenalty ?? null;
  const isDnf = isDNF(penalty);
  const displayTime = solveTime !== undefined
    ? isDnf ? "DNF" : formatMilliseconds(effectiveTime({ timeMs: solveTime, penalty }))
    : "";
  const originalTime = solveTime !== undefined && isPlusTwo(penalty) ? formatMilliseconds(solveTime) : null;

  const scrambleLines = useMemo(
    () => formatScrambleLines(solveScramble ?? "", solveEventId ?? null, multiline),
    [solveScramble, solveEventId, multiline],
  );

  function handleShare() {
    if (solveTime === undefined) return;
    openModal(ModalType.Share, {
      shareType: "solve",
      shareSolveData: {
        timeMs: solveTime,
        penalty: solvePenalty ?? null,
        scramble: solveScramble,
        eventId: solveEventId,
        createdAt: solveCreatedAt,
      } as ShareCardSolveData,
    });
  }

  function copyScramble() {
    if (solveScramble) {
      navigator.clipboard.writeText(solveScramble);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function handleNotesChange(value: string) {
    setNotes(value);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (solveId) {
        solveService.updateSolveNotes(solveId, value);
        setSaved(true);
      }
    }, 600);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <Modal
      showModal={activeModal === ModalType.SolveDetails}
      setShowModal={closeModal}
      title={undefined}
    >
      <div className="space-y-0">
        <div className="relative overflow-hidden rounded-t-2xl bg-linear-to-br from-accent/10 via-bg-elevated to-bg-elevated border-b border-border/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--accent),0.08),transparent_60%)]" />
          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={closeModal} className="text-muted hover:text-primary transition-colors">
                <X className="size-4" />
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted/60">
                {solveIndex !== undefined ? `Solve #${solveIndex + 1}` : "Solve"}
              </span>
              <button type="button" onClick={handleShare} className="text-muted hover:text-accent transition-colors" title="Share">
                <ShareIcon className="size-4" />
              </button>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="relative">
                {isDnf ? (
                  <span className="text-4xl font-black tabular-nums tracking-tight text-red-400 line-through">
                    DNF
                  </span>
                ) : (
                  <span className="text-4xl font-black tabular-nums tracking-tight text-primary">
                    {displayTime}
                  </span>
                )}
                {!isDnf && (
                  <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-accent/40 via-accent to-accent/40" />
                )}
              </div>
              {originalTime && (
                <span className="text-sm text-muted line-through">{originalTime}</span>
              )}
              <div className="flex items-center gap-1.5 ml-1">
                {isPlusTwo(penalty) && (
                  <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/12 border border-amber-500/20">
                    +2
                  </span>
                )}
                {isDnf && (
                  <span className="text-[11px] font-bold text-red-400 px-2 py-0.5 rounded-md bg-red-500/12 border border-red-500/20">
                    <DNFIcon className="size-3 inline -mt-0.5 mr-0.5" />
                    DNF
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {solveCreatedAt && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-border/10">
              <div className="size-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="size-3.5 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-muted/60 uppercase tracking-wider">Date</span>
                <span className="text-xs font-medium text-primary">
                  {new Date(solveCreatedAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="ml-auto text-[11px] text-muted/50 font-mono">
                {new Date(solveCreatedAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {solveSplits && solveSplits.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted/60 uppercase tracking-wider">Splits</span>
              <div className="flex items-center gap-2 flex-wrap">
                {solveSplits.map((ms, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-primary/50 border border-border/10">
                    <span className="text-[10px] font-semibold text-muted/50">{i + 1}</span>
                    <span className="text-xs font-bold tabular-nums text-primary">{formatMilliseconds(ms)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {solveScramble && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted/60 uppercase tracking-wider">Scramble</span>
                <button type="button"
                  onClick={copyScramble}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted/50 hover:text-accent transition-colors"
                >
                  {copied ? (
                    <><Check className="size-3" />Copied</>
                  ) : (
                    <><Copy className="size-3" />Copy</>
                  )}
                </button>
              </div>
              <div className="relative rounded-xl bg-bg-primary/60 overflow-hidden">
                <div className="pl-4 pr-3 py-3">
                  {scrambleLines ? (
                    <div className="flex flex-col items-start text-xs font-mono leading-relaxed space-y-0.5">
                      {scrambleLines.map((line, i) => (
                        <p
                          key={i}
                          className="whitespace-nowrap"
                          style={rainbowScramble ? { color: RAINBOW[i % RAINBOW.length] } : undefined}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-secondary leading-relaxed select-all break-all">
                      {solveScramble}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted/60 uppercase tracking-wider">Notes</span>
              <div className="flex items-center gap-2">
                {!saved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-muted/40 italic"
                  >
                    Saving...
                  </motion.span>
                )}
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full resize-none rounded-xl bg-bg-primary/60 border border-border/10 px-3.5 py-2.5 text-xs font-mono text-primary placeholder:text-muted/30 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/30 transition-all"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
