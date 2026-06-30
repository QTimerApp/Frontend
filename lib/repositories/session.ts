import { db, type DBSession } from "../db";

export const sessionRepository = {
  async findAll() {
    return db.sessions.toArray();
  },

  async findById(id: string) {
    return db.sessions.get(id);
  },

  async create(session: DBSession) {
    return db.sessions.add(session);
  },

  async update(id: string, data: Partial<DBSession>) {
    return db.sessions.update(id, data);
  },

  async delete(id: string) {
    return db.sessions.delete(id);
  },
};
