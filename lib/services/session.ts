import { generateId } from "@/lib/utils/uuid";
import { db, type DBSession } from "../db";
import { sessionRepository } from "../repositories/session";
import { solveRepository } from "../repositories/solve";

export const sessionService = {
  async createSession(name: string, eventId: string): Promise<DBSession> {
    const now = new Date().toISOString();
    const last = await db.sessions.orderBy("sortOrder").last();
    const maxOrder = last?.sortOrder ?? 0;
    const session: DBSession = {
      id: generateId(),
      name,
      eventId,
      sortOrder: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };
    await sessionRepository.create(session);
    return session;
  },

  async updateSession(id: string, data: Partial<Pick<DBSession, "name" | "eventId">>) {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    await sessionRepository.update(id, updated);
  },

  async deleteSession(id: string) {
    await solveRepository.deleteBySession(id);
    await sessionRepository.delete(id);
  },

  async reorderSessions(orderedIds: string[]) {
    await db.transaction("rw", db.sessions, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.sessions.update(orderedIds[i], { sortOrder: i });
      }
    });
  },
};
