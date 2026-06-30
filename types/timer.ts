export enum Time {
  second = 1000,
  minute = 1000 * 60,
  hour = 1000 * 60 * 60,
  day = 1000 * 60 * 60 * 24,
}

export const INSPECTION_DURATION_MS = Time.second * 15;
export const PLUS2_WINDOW_MS = Time.second * 2;

export enum TimerState {
  Idle = "Idle",
  Ready = "Ready",
  Waiting = "Waiting",
  Running = "Running",
  Stopped = "Stopped",
  Inspecting = "Inspecting",
  Plus2Wait = "Plus2Wait",
}

export interface MachineState {
  state: TimerState;
  time: number;
  phases: number[];
  currentPhase: number;
  spacePressed: boolean;
  hasPlus2: boolean;
  autoDnf: boolean;
}

export type Action =
  | { type: "PRESS"; multiphase?: number }
  | { type: "RELEASE"; inspectionEnabled: boolean }
  | { type: "TICK"; elapsed: number }
  | { type: "DISMISS" }
  | { type: "START_TIMER" };

