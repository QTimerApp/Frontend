export enum ModalType {
  AddSession = "add-session",
  EditSession = "edit-session",
  SolveDetails = "solve-details",
  AverageDetails = "average-details",
  Delete = "delete",
  Share = "share",
}

export enum DeleteTarget {
  Solve = "solve",
  Average = "average",
  Session = "session",
}

export interface ModalData {
  solveIndex?: number;
  solveTime?: number;
  solveScramble?: string;
  solvePenalty?: string | null;
  solveCreatedAt?: string;
  solveEventId?: string;
  solveId?: string;
  solveNotes?: string;
  solveSplits?: number[];
  groupSize?: number;
  averageValue?: string;
  averageSolves?: Array<{
    id: string;
    timeMs: number;
    penalty: string | null;
    scramble: string;
    createdAt: string;
    eventId?: string;
  }>;
  deleteTarget?: DeleteTarget;
  handleDeleteSolve?: () => void;
  handleDeleteAverage?: () => void;
  handleDeleteSession?: () => void;
  sessionId?: string;
  sessionName?: string;
  sessionEventId?: string;
  shareType?: "solve" | "average";
  shareSolveData?: {
    timeMs: number;
    penalty?: string | null;
    scramble?: string;
    eventId?: string;
    createdAt?: string;
  };
  shareAverageData?: {
    groupSize: number;
    averageValue: string;
    solves: Array<{
      id: string;
      timeMs: number;
      penalty: string | null;
      scramble: string;
    }>;
    eventId?: string;
    createdAt?: string;
  };
}
