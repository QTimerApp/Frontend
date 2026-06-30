"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { X, Copy, Check, Layers, Share as ShareIcon } from "@/components/icons";
import { formatMilliseconds, formatScrambleLines } from "@/lib/utils/format";
import { isDNF, isPlusTwo, effectiveTime } from "@/types/penalty";
import { RAINBOW } from "@/constants/colors";

export function AverageModal() {
  const { activeModal, closeModal, openModal, modalData } = useModal();
  const { groupSize, averageValue, averageSolves, sessionName } = modalData;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const multiline = useSettingsStore((s) => s.settings.multiline);
  const rainbowScramble = useSettingsStore((s) => s.settings.rainbowScramble);

  function handleShare() {
    if (!averageSolves) return;
    const eventName = (averageSolves[0] as any)?.eventId || sessionName || "";
    openModal(ModalType.Share, {
      shareType: "average",
      shareAverageData: {
        groupSize: groupSize ?? 5,
        averageValue: averageValue ?? "—",
        solves: averageSolves.map((s) => ({
          id: s.id,
          timeMs: s.timeMs,
          penalty: s.penalty,
          scramble: s.scramble,
        })),
        eventId: eventName,
      },
    });
  }

  if (!averageSolves) return null;

  const times = averageSolves.map((s) => ({
    ...s,
    effective: effectiveTime({ timeMs: s.timeMs, penalty: s.penalty }),
  }));
  const best = Math.min(...times.map((t) => t.effective));
  const worst = Math.max(
    ...times.filter((t) => !isDNF(t.penalty)).map((t) => t.effective),
  );

  function copyScramble(scramble: string, index: number) {
    navigator.clipboard.writeText(scramble);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  return (
    <Modal
      showModal={activeModal === ModalType.AverageDetails}
      setShowModal={closeModal}
      title={undefined}
    >
      <div className="space-y-0">
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-accent/10 via-bg-elevated to-bg-elevated border-b border-border/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--accent),0.08),transparent_60%)]" />
          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={closeModal} className="text-muted hover:text-primary transition-colors">
                <X className="size-4" />
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted/60">
                Ao{groupSize}
              </span>
              <button type="button" onClick={handleShare} className="text-muted hover:text-accent transition-colors" title="Share">
                <ShareIcon className="size-4" />
              </button>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Layers className="size-4 text-accent" />
              </div>
              <span className="text-3xl font-black tabular-nums tracking-tight text-primary">
                {averageValue}
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border/20 to-transparent" />
            </div>
            {sessionName && (
              <div className="mt-2 ml-11">
                <span className="text-xs text-muted/60">{sessionName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {averageSolves.map((solve, i) => {
              const effective = effectiveTime({
                timeMs: solve.timeMs,
                penalty: solve.penalty,
              });
              const isBest = effective === best && !isDNF(solve.penalty);
              const isWorst = effective === worst && !isDNF(solve.penalty);
              const dnff = isDNF(solve.penalty);
              return (
                <motion.div
                  key={solve.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`group flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    isBest
                      ? "bg-emerald-500/6 border border-emerald-500/12"
                      : isWorst
                      ? "bg-red-500/6 border border-red-500/12"
                      : "bg-bg-primary/60 border border-border/8 hover:border-border/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5 shrink-0 w-10 pt-0.5">
                    <span className={`text-[11px] font-semibold ${
                      isBest ? "text-emerald-400" : isWorst ? "text-red-400" : "text-muted/50"
                    }`}>
                      #{i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          dnff
                            ? "text-red-400 line-through"
                            : "text-primary"
                        }`}
                      >
                        {dnff ? "DNF" : formatMilliseconds(solve.timeMs)}
                      </span>
                      {isPlusTwo(solve.penalty) && (
                        <span className="text-[10px] font-bold text-amber-400/80 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/15">
                          +2
                        </span>
                      )}
                      {isBest && (
                        <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-500/12 border border-emerald-500/20">
                          BEST
                        </span>
                      )}
                      {isWorst && (
                        <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded-md bg-red-500/12 border border-red-500/20">
                          WORST
                        </span>
                      )}
                    </div>
                    {(() => {
                      const sl = formatScrambleLines(solve.scramble ?? "", solve.eventId ?? null, multiline);
                      if (sl) {
                        return (
                          <div className="text-[11px] font-mono text-muted/60 mt-0.5 space-y-0 leading-tight">
                            {sl.map((line, li) => (
                              <p
                                key={li}
                                className="whitespace-nowrap"
                                style={rainbowScramble ? { color: RAINBOW[li % RAINBOW.length] } : undefined}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <p className="text-[11px] font-mono text-muted/60 truncate mt-0.5 select-all">
                          {solve.scramble}
                        </p>
                      );
                    })()}
                  </div>
                  <button type="button"
                    onClick={() => copyScramble(solve.scramble, i)}
                    className="shrink-0 size-7 flex items-center justify-center rounded-lg text-muted/40 hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy scramble"
                  >
                    {copiedIndex === i ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
