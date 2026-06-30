"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { sessionService } from "@/lib/services/session";
import { PUZZLE_TYPES } from "@/features/sessions/puzzle-types";
import { Edit, Note, Layers } from "@/components/icons";

export function EditSessionModal() {
  const { activeModal, closeModal, modalData } = useModal();
  const { sessionId, sessionName, sessionEventId } = modalData;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeModal === ModalType.EditSession) {
      setName(sessionName ?? "");
      setLoading(false);
    }
  }, [activeModal, sessionName]);

  async function handleSave() {
    if (!name.trim() || !sessionId) return;
    setLoading(true);
    try {
      await sessionService.updateSession(sessionId, {
        name: name.trim(),
      });
      closeModal();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !name.trim();
  const currentPuzzle = PUZZLE_TYPES.find((p) => p.name === sessionEventId);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSave();
  }

  return (
    <Modal showModal={activeModal === ModalType.EditSession} setShowModal={closeModal}>
      <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-blue-500/15 flex items-center justify-center shrink-0 ring-1 ring-blue-500/20">
            <Edit className="size-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-primary">Edit Session</h2>
            <p className="text-xs text-muted mt-0.5">Change the session name</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="session-name" className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            <Note className="size-3.5" />
            Session name
          </label>
          <input id="session-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Session name"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border/25 text-sm text-primary placeholder:text-muted/50 focus:outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/10 transition-all"
          />
        </div>

        <div className="space-y-2.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            <Layers className="size-3.5" />
            Puzzle type
          </span>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-primary border border-border/20 opacity-60">
            <div className="size-6 flex items-center justify-center shrink-0">
              {currentPuzzle && <currentPuzzle.icon />}
            </div>
            <span className="text-sm font-medium text-primary">{sessionEventId}</span>
            <span className="text-[10px] text-muted ml-auto">Cannot be changed</span>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-border/10">
          <Button type="button" onClick={closeModal} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={disabled} loading={loading}>
            Save Changes
          </Button>
        </div>
    </form>
    </Modal>
  );
}
