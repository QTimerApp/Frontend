import { db, type DBSolve } from "../db";

export const solveRepository = {
  async findBySession(sessionId: string) {
    return db.solves
      .where("sessionId")
      .equals(sessionId)
      .sortBy("createdAt");
  },

  async create(solve: DBSolve) {
    return db.solves.add(solve);
  },

  async update(id: string, data: Partial<DBSolve>) {
    return db.solves.update(id, data);
  },

  async delete(id: string) {
    return db.solves.delete(id);
  },

  async deleteBySession(sessionId: string) {
    return db.solves
      .where("sessionId")
      .equals(sessionId)
      .delete();
  },
};
