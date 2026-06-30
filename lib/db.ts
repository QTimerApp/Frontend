import Dexie, { type Table } from "dexie";
import type { DBSession, DBSolve, DBSettings } from "@/types/db";

export type { DBSession, DBSolve, DBSettings };

class TimerDatabase extends Dexie {
  sessions!: Table<DBSession, string>;
  solves!: Table<DBSolve, string>;
  settings!: Table<DBSettings, string>;

  constructor() {
    super("QTimer");
    this.version(2).stores({
      sessions: "id, name, eventId, createdAt, updatedAt",
      solves: "id, sessionId, timeMs, penalty, scramble, createdAt, updatedAt",
    }).upgrade(async (tx) => {
      const sessions = await tx.table("sessions").toArray();
      for (const s of sessions) {
        if (!s.eventId && s.type) {
          await tx.table("sessions").update(s.id, { eventId: s.type });
        }
      }
    });
    this.version(3).stores({
      sessions: "id, name, eventId, createdAt, updatedAt",
      solves: "id, sessionId, timeMs, penalty, scramble, createdAt, updatedAt",
      settings: "id",
    });
    this.version(4).stores({
      sessions: "id, name, eventId, sortOrder, createdAt, updatedAt",
      solves: "id, sessionId, timeMs, penalty, scramble, createdAt, updatedAt",
      settings: "id",
    });
  }
}

export const db = new TimerDatabase();
