"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { toPng } from "html-to-image";
import type { ShareCardSolveData, ShareCardAverageData } from "@/components/ShareCard";
import { Download, Share as ShareIcon, X, Check, Copy } from "@/components/icons";
import { toast } from "@/components/ToasterProvider";

const ShareCard = dynamic(() => import("@/components/ShareCard").then((m) => m.ShareCard), { ssr: false });

export function ShareModal() {
  const { activeModal, closeModal, modalData } = useModal();
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "done">("idle");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { shareType, shareSolveData, shareAverageData } = modalData;

  useEffect(() => {
    if (activeModal === ModalType.Share) {
      setStatus("idle");
      setBlobUrl(null);
      document.body.style.overflow = "hidden";
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
      };
      document.addEventListener("keydown", handler);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handler);
      };
    }
  }, [activeModal, closeModal]);

  const handleGenerate = useCallback(async () => {
    if (!cardRef.current) return;
    setStatus("generating");
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      setBlobUrl(dataUrl);
      setStatus("ready");
    } catch {
      setStatus("idle");
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    const label = shareType === "solve" ? "solve" : `ao${(shareAverageData as ShareCardAverageData)?.groupSize || 5}`;
    a.download = `qtimer-${label}.png`;
    a.click();
    setStatus("done");
  }, [blobUrl, shareType, shareAverageData]);

  const handleCopyImage = useCallback(async () => {
    if (!blobUrl) return;
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("Image copied", { description: "Paste it anywhere to share.", icon: <Copy className="size-4" />, duration: 2500 });
      setStatus("done");
    } catch {
      toast("Could not copy", { description: "Try downloading instead." });
    }
  }, [blobUrl]);

  return (
    <AnimatePresence>
      {activeModal === ModalType.Share && (
        <motion.div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <button type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm border-none cursor-default"
            onClick={closeModal}
          />
          <motion.div
            className="relative bg-bg-elevated border border-border/20 rounded-2xl shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto mx-4 w-full"
            style={{ maxWidth: 540 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="px-5 pt-5 pb-1 flex items-center justify-between border-b border-border/10">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted/60">Share</span>
              <button type="button" onClick={closeModal} className="text-muted hover:text-primary transition-colors">
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div ref={cardRef} className="rounded-xl overflow-hidden">
                {shareType === "solve" && shareSolveData ? (
                  <ShareCard type="solve" data={shareSolveData as ShareCardSolveData} />
                ) : shareType === "average" && shareAverageData ? (
                  <ShareCard type="average" data={shareAverageData as ShareCardAverageData} />
                ) : null}
              </div>

              {!blobUrl && status !== "generating" && (
                <div className="flex justify-center">
                  <button type="button" onClick={handleGenerate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-[var(--accent-text)] text-sm font-semibold hover:bg-accent-hover transition-colors"
                  >
                    <ShareIcon className="size-4" />
                    Generate Image
                  </button>
                </div>
              )}

              {status === "generating" && (
                <div className="flex justify-center py-3">
                  <motion.div
                    className="size-5 rounded-full border-2 border-accent border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  />
                </div>
              )}

              {blobUrl && (
                <div className="flex items-center gap-3 justify-center">
                  <button type="button" onClick={handleCopyImage}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-[var(--accent-text)] text-sm font-semibold hover:bg-accent-hover transition-colors"
                  >
                    <Copy className="size-4" />
                    Copy Image
                  </button>
                  <button type="button" onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-elevated text-primary text-sm font-semibold hover:bg-bg-hover transition-colors border border-border/20"
                  >
                    <Download className="size-4" />
                    Download
                  </button>
                </div>
              )}

              {status === "done" && (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
                  <Check className="size-3.5" />
                  <span>Saved!</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
