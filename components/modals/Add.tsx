"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { sessionService } from "@/lib/services/session";
import { useStore } from "@/lib/stores/use";
import { PUZZLE_TYPES } from "@/features/sessions/puzzle-types";
import { Note, Layers } from "@/components/icons";

export function AddModal() {
  const router = useRouter();
  const { activeModal, closeModal } = useModal();
  const setSelectedSessionId = useStore((s) => s.setSelectedSessionId);
  const setSelectedEventId = useStore((s) => s.setSelectedEventId);
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("3x3");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeModal === ModalType.AddSession) {
      setName("");
      setEventId("3x3");
      setLoading(false);
    }
  }, [activeModal]);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const session = await sessionService.createSession(name.trim(), eventId);
      setSelectedSessionId(session.id);
      setSelectedEventId(eventId);
      closeModal();
      router.push(`/session/${session.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !name.trim();

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleCreate();
  }

  return (
    <Modal showModal={activeModal === ModalType.AddSession} setShowModal={closeModal}>
      <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0 ring-1 ring-accent/20">
            <Layers className="size-5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-primary">New Session</h2>
            <p className="text-xs text-muted mt-0.5">Create a fresh session to track solves</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="add-session-name" className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            <Note className="size-3.5" />
            Session name
          </label>
          <input id="add-session-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "OH Practice"'
            className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border/25 text-sm text-primary placeholder:text-muted/50 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
          />
        </div>

        <div className="space-y-2.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            <Layers className="size-3.5" />
            Puzzle type
          </span>
          <div className="grid grid-cols-4 gap-2">
            {PUZZLE_TYPES.map((type) => {
              const selected = eventId === type.name;
              return (
                <button type="button"
                  key={type.name}
                  onClick={() => setEventId(type.name)}
                  className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-150 ${
                    selected
                      ? "bg-accent/12 text-accent ring-1 ring-accent/25 scale-[1.02]"
                      : "bg-bg-primary text-muted hover:text-secondary hover:bg-bg-hover/40 ring-1 ring-transparent hover:ring-border/20"
                  }`}
                >
                  {selected && (
                    <div className="absolute inset-0 rounded-2xl bg-accent/5" />
                  )}
                  <div className={`relative size-7 flex items-center justify-center transition-transform duration-150 ${
                    selected ? "scale-110" : "group-hover:scale-105"
                  }`}>
                    <type.icon />
                  </div>
                  <span className={`relative text-[9px] font-semibold leading-tight ${
                    selected ? "text-accent" : "text-muted group-hover:text-secondary"
                  }`}>
                    {type.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-border/10">
          <Button type="button" onClick={closeModal} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreate} variant="primary" size="md" disabled={disabled} loading={loading}>
            Create Session
          </Button>
        </div>
    </form>
    </Modal>
  );
}
