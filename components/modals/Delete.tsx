"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useModal, DeleteTarget, ModalType } from "@/lib/contexts/Modal";
import { Trash } from "@/components/icons";

export function DeleteModal() {
  const { activeModal, closeModal, modalData } = useModal();
  const { deleteTarget, handleDeleteSolve, handleDeleteAverage, handleDeleteSession, sessionName } = modalData;
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (activeModal === ModalType.Delete) setConfirm("");
  }, [activeModal]);

  if (!deleteTarget) return null;

  const isSession = deleteTarget === DeleteTarget.Session;
  const confirmWord = isSession ? sessionName ?? "session" : "delete";
  const targetLabel = isSession ? "session" : deleteTarget === DeleteTarget.Solve ? "solve" : "average";
  const matched = isSession
    ? confirm.trim().toLowerCase() === confirmWord.trim().toLowerCase()
    : confirm === confirmWord;

  function handleDelete() {
    if (!matched) return;
    if (deleteTarget === DeleteTarget.Solve && handleDeleteSolve) {
      handleDeleteSolve();
    } else if (deleteTarget === DeleteTarget.Average && handleDeleteAverage) {
      handleDeleteAverage();
    } else if (isSession && handleDeleteSession) {
      handleDeleteSession();
    }
    closeModal();
    setConfirm("");
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matched) handleDelete();
  }

  return (
    <Modal showModal={activeModal === ModalType.Delete} setShowModal={closeModal}>
      <form onSubmit={handleFormSubmit} className="p-5 text-center space-y-4">
        <div className="size-10 mx-auto rounded-xl bg-red-500/10 flex items-center justify-center">
          <Trash className="size-4 text-red-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-primary">
            Delete this {targetLabel}?
          </h2>
          <p className="text-xs text-muted leading-relaxed max-w-64 mx-auto">
            {deleteTarget === DeleteTarget.Solve
              ? "This will permanently remove this solve from your session."
              : isSession
                ? "This will permanently delete this session and all its solves."
                : "This will permanently remove this average and all its solves."}
          </p>
        </div>
        <p className="text-[11px] text-muted/60">
          {isSession
            ? <>Type <span className="font-mono text-red-400 font-semibold">{sessionName}</span> to confirm.</>
            : <>Type <span className="font-mono text-red-400 font-semibold">delete</span> to confirm.</>}
        </p>
        <label htmlFor="delete-confirm" className="sr-only">Type "{isSession ? sessionName : "delete"}" to confirm</label>
        <input id="delete-confirm"
          autoFocus
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={isSession ? `"${sessionName}"` : '"delete"'}
          className="w-full max-w-48 mx-auto px-3 py-2 rounded-lg bg-bg-primary border border-border/25 text-sm text-primary placeholder:text-muted/30 text-center font-mono focus:outline-none focus:border-red-400/40 focus:ring-2 focus:ring-red-400/10 transition-all"
        />
        <div className="flex justify-center gap-2">
          <Button type="button"
            onClick={() => { closeModal(); setConfirm(""); }}
            variant="secondary"
            size="sm"
          >
            Cancel
          </Button>
          <Button type="submit"
            variant="danger"
            size="sm"
            disabled={!matched}
          >
            Delete
          </Button>
        </div>
    </form>
    </Modal>
  );
}
