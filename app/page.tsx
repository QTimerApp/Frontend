"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { PUZZLE_TYPES } from "@/features/sessions/puzzle-types";
import { ChevronRight, Clock, Plus } from "@/components/icons";

export default function Home() {
  const sessions = useLiveQuery(() => db.sessions.toArray());
  const totalSolves = useLiveQuery(() => db.solves.count(), []);
  const todaySolves = useLiveQuery(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    return db.solves.where("createdAt").aboveOrEqual(start).count();
  }, []);
  const router = useRouter();
  const { openModal } = useModal();

  const solving = sessions && sessions.length > 0;
  const totalSessions = sessions?.length ?? 0;
  const sortedSessions = sessions ? [...sessions].sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)) : [];

  return (
    <>
      <title>QTimer</title>
      <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-5 pt-12 pb-8">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-primary">QTimer</h1>
            {solving ? (
              <p className="text-xs text-muted">Select a session to start timing</p>
            ) : (
              <p className="text-xs text-muted">Create a session to get started</p>
            )}
          </div>

          {solving && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums text-primary">{totalSolves}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider">Total solves</div>
              </div>
              <div className="w-px h-8 bg-border/30" />
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums text-primary">{todaySolves}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider">Today</div>
              </div>
              <div className="w-px h-8 bg-border/30" />
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums text-primary">{totalSessions}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider">Sessions</div>
              </div>
            </div>
          )}

          {solving && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-secondary uppercase tracking-wider">Sessions</span>
                <button type="button"
                  onClick={() => openModal(ModalType.AddSession)}
                  className="text-[11px] font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  + New
                </button>
              </div>
              {sortedSessions.map((session) => {
                const puzzle = PUZZLE_TYPES.find((p) => p.name === session.eventId);
                return (
                  <button type="button"
                    key={session.id}
                    onClick={() => router.push(`/session/${session.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-elevated/50 border border-border/10 hover:bg-bg-elevated/80 active:scale-[0.98] transition-all text-left"
                  >
                    <div className="size-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      {puzzle && <puzzle.icon />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary truncate">{session.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-muted">
                        <span>{puzzle?.name ?? session.eventId}</span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted/40 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {!solving && (
            <div className="text-center space-y-5">
              <div className="size-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
                <Clock className="size-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-secondary">No sessions yet</p>
                <p className="text-xs text-muted mt-1">Create a session to start tracking your solves</p>
              </div>
              <button type="button"
                onClick={() => openModal(ModalType.AddSession)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-(--accent-text) text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all"
              >
                <Plus className="size-4" />
                Create Session
              </button>
              <div className="pt-4">
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {PUZZLE_TYPES.slice(0, 6).map((p) => (
                    <div key={p.name} className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-bg-elevated/30 border border-border/10">
                      <div className="size-5 text-muted/60">{p.icon()}</div>
                      <span className="text-[10px] text-muted/60">{p.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted/40 mt-3">Supported puzzles</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
