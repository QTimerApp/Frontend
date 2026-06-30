import { TimerState, INSPECTION_DURATION_MS, PLUS2_WINDOW_MS, type MachineState, type Action, Time } from "@/types/timer";

function fresh(time = 0) {
  return {
    time,
    phases: [] as number[],
    currentPhase: 0,
    spacePressed: false,
    hasPlus2: false,
    autoDnf: false,
  };
}

export const INITIAL_STATE: MachineState = {
  state: TimerState.Idle,
  ...fresh(),
};

export function machine(prev: MachineState, action: Action): MachineState {
  switch (action.type) {
    case "PRESS":
      if (prev.state === TimerState.Idle)
        return { state: TimerState.Ready, ...fresh(), spacePressed: true };

      if (prev.state === TimerState.Inspecting)
        return { state: TimerState.Running, ...fresh(), spacePressed: true };

      if (prev.state === TimerState.Plus2Wait)
        return { state: TimerState.Running, ...fresh(), spacePressed: true, hasPlus2: true };

      if (prev.state === TimerState.Running) {
        const totalPhases = action.multiphase ?? 0;
        if (totalPhases > 1 && prev.currentPhase < totalPhases - 1) {
          return {
            ...prev,
            phases: [...prev.phases, prev.time],
            currentPhase: prev.currentPhase + 1,
            spacePressed: true,
          };
        }
        return {
          ...prev,
          state: TimerState.Stopped,
          phases: [...prev.phases, prev.time],
          currentPhase: 0,
          spacePressed: true,
          autoDnf: false,
        };
      }

      if (prev.state === TimerState.Stopped)
        return { state: TimerState.Ready, ...fresh(), spacePressed: true };

      if (prev.state === TimerState.Waiting)
        return { state: TimerState.Ready, ...fresh(), spacePressed: true };

      return prev;

    case "RELEASE":
      if (prev.state === TimerState.Ready) {
        if (action.inspectionEnabled)
          return { state: TimerState.Inspecting, ...fresh() };
        return { ...prev, state: TimerState.Waiting, spacePressed: false };
      }
      return prev;

    case "TICK":
      if (prev.state === TimerState.Inspecting) {
        const elapsed = action.elapsed;
        if (elapsed >= INSPECTION_DURATION_MS)
          return { ...prev, state: TimerState.Plus2Wait, time: INSPECTION_DURATION_MS };
        return { ...prev, time: elapsed };
      }
      if (prev.state === TimerState.Plus2Wait) {
        const elapsed = action.elapsed;
        if (elapsed >= INSPECTION_DURATION_MS + PLUS2_WINDOW_MS)
          return { ...prev, state: TimerState.Stopped, time: elapsed, spacePressed: false, autoDnf: true };
        return { ...prev, time: elapsed };
      }
      if (prev.state === TimerState.Running)
        return { ...prev, time: action.elapsed };
      return prev;

    case "START_TIMER":
      if (prev.state === TimerState.Waiting)
        return { state: TimerState.Running, ...fresh() };
      return prev;

    case "DISMISS":
      return { state: TimerState.Idle, ...fresh() };

    default:
      return prev;
  }
}

export function displayFromMs(ms: number): string {
  const totalSec = Math.floor(ms / Time.second);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const dec = Math.floor((ms % Time.second) / 100);
  if (min > 0) return `${min}:${String(sec).padStart(2, "0")}.${dec}`;
  return `${sec}.${dec}`;
}

export function beep(ctx: AudioContext | null, freq: number, duration: number, vol: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}
