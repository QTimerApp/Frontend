import type { ThemeDefinition } from "./themes";

export enum InspectionMode {
  Off = "off",
  FifteenSeconds = "15s",
}

export enum TimerActivation {
  Spacebar = "spacebar",
  Click = "click",
  Tap = "tap",
}

export enum StartDelay {
  Off = "off",
  Ms150 = "150",
  Ms300 = "300",
  Ms500 = "500",
}

export enum ScrambleImageSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

export enum SolvesGroupSize {
  Off = "off",
  Ao5 = 5,
  Ao12 = 12,
  Ao50 = 50,
  Ao100 = 100,
}

export enum SettingsTab {
  General = "general",
  Themes = "themes",
  Timer = "timer",
  Scramble = "scramble",
  Session = "session",
  Statistics = "statistics",
  Notifications = "notifications",
}

export interface Settings {
  theme: string;
  showStatsPanel: boolean;
  inspection: InspectionMode;
  timerActivation: TimerActivation;
  autoStart: boolean;
  startDelay: StartDelay;
  soundEnabled: boolean;
  multiphase: number;
  scrambleImageSize: ScrambleImageSize;
  showScrambleImage: boolean;
  multiline: boolean;
  rainbowScramble: boolean;
  rainbowSolves: boolean;
  confirmDelete: boolean;
  hideTimeDuringSolve: boolean;
  manualEntry: boolean;
  autoCollapseAverages: boolean;
  displayStatAo5: boolean;
  displayStatAo12: boolean;
  displayStatAo50: boolean;
  displayStatAo100: boolean;
  solvesGroupSize: SolvesGroupSize | "off";
  customThemes: ThemeDefinition[];
  notifyPB: boolean;
  notifyWorstSolve: boolean;
  notifyBestAverage: boolean;
  notifySettingsChange: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  showStatsPanel: true,
  inspection: InspectionMode.Off,
  timerActivation: TimerActivation.Spacebar,
  autoStart: false,
  startDelay: StartDelay.Off,
  soundEnabled: false,
  multiphase: 0,
  scrambleImageSize: ScrambleImageSize.Medium,
  showScrambleImage: true,
  multiline: true,
  rainbowScramble: false,
  rainbowSolves: true,
  confirmDelete: true,
  hideTimeDuringSolve: false,
  manualEntry: false,
  autoCollapseAverages: false,
  displayStatAo5: true,
  displayStatAo12: true,
  displayStatAo50: true,
  displayStatAo100: true,
  solvesGroupSize: SolvesGroupSize.Off,
  customThemes: [],
  notifyPB: true,
  notifyWorstSolve: false,
  notifyBestAverage: true,
  notifySettingsChange: true,
};
