import { generateId } from "@/lib/utils/uuid";
import { solveRepository } from "../repositories/solve";
import { db } from "../db";
import { Penalty } from "@/types/penalty";

export const solveService = {
  async createSolve(
    sessionId: string,
    scramble: string,
    timeMs: number,
    penalty: Penalty | null,
    splits?: number[] | null,
  ) {
    const id = generateId();
    await solveRepository.create({
      id,
      sessionId,
      timeMs,
      penalty,
      scramble,
      notes: "",
      splits: splits ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return id;
  },

  async updateSolvePenalty(id: string, penalty: Penalty | null) {
    await solveRepository.update(id, { penalty, updatedAt: new Date().toISOString() });
  },

  async updateSolveNotes(id: string, notes: string) {
    await solveRepository.update(id, { notes, updatedAt: new Date().toISOString() });
  },

  async deleteSolve(id: string) {
    await solveRepository.delete(id);
  },

  async deleteSolves(ids: string[]) {
    await db.solves.bulkDelete(ids);
  },
};
