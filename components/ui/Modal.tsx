"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { X } from "@/components/icons";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface ModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({
  showModal,
  setShowModal,
  children,
  title,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    },
    [setShowModal],
  );

  useEffect(() => {
    if (showModal) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [showModal, onKeyDown]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showModal]);

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <button type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm border-none"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            className="relative w-full sm:max-w-md bg-bg-elevated border border-border/20 sm:rounded-2xl rounded-t-2xl shadow-2xl shadow-black/40 max-h-[85vh] overflow-y-auto"
            initial={{ opacity: 0, y: isMobile ? "100%" : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? "100%" : 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 pt-5 pb-0 sticky top-0 bg-bg-elevated z-10">
                <div className="flex items-center gap-3">
                  <div className="sm:hidden w-8 h-1 rounded-full bg-border/50 mx-auto" />
                  <h2 className="text-sm font-bold text-primary">{title}</h2>
                </div>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="ghost"
                  size="icon"
                  className="-mr-1 rounded-lg"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Modal };
