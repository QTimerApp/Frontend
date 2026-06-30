export interface SolveLike {
  timeMs: number;
  penalty?: string | null;
  createdAt?: string;
}

export interface Solve {
  id: string;
  scramble: string;
  timeMs: number;
  penalty?: string | null;
  splits?: number[] | null;
  notes?: string;
  createdAt?: string;
}
