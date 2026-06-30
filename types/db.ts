export interface DBSession {
  id: string;
  name: string;
  eventId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBSolve {
  id: string;
  sessionId: string;
  timeMs: number;
  penalty: string | null;
  scramble: string;
  notes: string;
  splits: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBSettings {
  id: string;
  data: string;
}
