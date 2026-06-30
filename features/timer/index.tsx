"use client";

import { useEffect, useRef, useReducer, useCallback } from "react";

import { formatMilliseconds } from "@/lib/utils/format";
import { useStore } from "@/lib/stores/use";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import { generateScramble } from "@/lib/utils/scramble";
import { solveService } from "@/lib/services/solve";
import { checkSolveMilestones } from "@/lib/services/notification";

import { Time, TimerState, INSPECTION_DURATION_MS } from "@/types/timer";
import { TimerActivation } from "@/types/settings";
import { DEFAULT_EVENT } from "@/types/puzzle";
import { Penalty } from "@/types/penalty";

import { machine, INITIAL_STATE, displayFromMs, beep } from "./machine";
import { PenaltyButtons } from "./PenaltyButtons";
import { ManualEntry } from "./ManualEntry";

function PhaseSplitLabel({ ms, idx }: { ms: number; idx: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground/50 font-medium">{idx + 1}</span>
      <span className="text-primary/80 font-bold tabular-nums">
        {formatMilliseconds(ms)}
      </span>
    </div>
  );
}

function shouldUsePointer(activation: string): boolean {
  return activation === TimerActivation.Click || activation === TimerActivation.Tap;
}

const Timer: React.FC = () => {
  const setScramble = useStore((s) => s.setScramble);
  const scramble = useStore((s) => s.scramble);
  const selectedSessionId = useStore((s) => s.selectedSessionId);
  const selectedEventId = useStore((s) => s.selectedEventId);
  const { inspection, startDelay, soundEnabled, hideTimeDuringSolve, manualEntry, multiphase, timerActivation } = useSettingsStore(
    (s) => s.settings
  );

  const [{ state, time, phases, currentPhase, spacePressed, hasPlus2, autoDnf }, dispatch] = useReducer(machine, INITIAL_STATE);

  const timeRef = useRef(time);
  const scrambleRef = useRef(scramble);
  const stateRef = useRef(state);
  const sessionRef = useRef(selectedSessionId);
  const eventRef = useRef(selectedEventId);
  const { activeModal, openModal } = useModal();
  const activeModalRef = useRef(activeModal);
  const startTimeRef = useRef(0);
  const setScrambleRef = useRef(setScramble);
  const lastSolveIdRef = useRef<string | null>(null);
  const lastSolveTimeRef = useRef(0);
  const lastSolveScrambleRef = useRef("");
  const lastSolveSplitsRef = useRef<number[] | undefined>(undefined);
  const hasPlus2Ref = useRef(hasPlus2);
  const inspectionRef = useRef(inspection);
  const soundRef = useRef(soundEnabled);
  const delayRef = useRef(startDelay);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastInspectionBeepRef = useRef(-1);

  const ensureAudioCtx = useCallback(() => {
    if (audioCtxRef.current?.state === "closed") {
      audioCtxRef.current = null;
    }
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);
  const hideTimeRef = useRef(hideTimeDuringSolve);
  const multiphaseRef = useRef(multiphase);
  const phaseRef = useRef(currentPhase);
  const phasesRef = useRef(phases);
  const manualEntryRef = useRef(manualEntry);
  const manualPreviewRef = useRef<string | null>(null);
  const activationRef = useRef(timerActivation);
  const containerRef = useRef<HTMLDivElement>(null);
  const pressHandlerRef = useRef<(() => void) | null>(null);
  const releaseHandlerRef = useRef<(() => void) | null>(null);
  const isTimerTouchRef = useRef(false);

  timeRef.current = time;
  scrambleRef.current = scramble;
  stateRef.current = state;
  sessionRef.current = selectedSessionId;
  eventRef.current = selectedEventId;
  activeModalRef.current = activeModal;
  setScrambleRef.current = setScramble;
  hasPlus2Ref.current = hasPlus2;
  inspectionRef.current = inspection;
  soundRef.current = soundEnabled;
  delayRef.current = startDelay;
  hideTimeRef.current = hideTimeDuringSolve;
  multiphaseRef.current = multiphase;
  phaseRef.current = currentPhase;
  phasesRef.current = phases;
  manualEntryRef.current = manualEntry;
  activationRef.current = timerActivation;

  const saveSolve = useCallback(() => {
    const sid = sessionRef.current;
    if (!sid) return;
    const penalty = hasPlus2Ref.current ? Penalty.PlusTwo : null;
    const solveTime = timeRef.current;
    const currentScramble = scrambleRef.current;
    const mp = multiphaseRef.current;

    if (mp > 1) {
      const isLastPhase = phaseRef.current >= mp - 1;
      if (!isLastPhase) return;
      const splits = [...phasesRef.current, solveTime];
      setScrambleRef.current(generateScramble(eventRef.current || DEFAULT_EVENT));
      lastSolveTimeRef.current = solveTime;
      lastSolveScrambleRef.current = currentScramble;
      lastSolveSplitsRef.current = splits;
      solveService
        .createSolve(sid, currentScramble, solveTime, penalty, splits)
        .then((id) => {
          lastSolveIdRef.current = id;
          checkSolveMilestones(sid, solveTime, penalty, useSettingsStore.getState().settings);
        });
      return;
    }

    setScrambleRef.current(generateScramble(eventRef.current || DEFAULT_EVENT));
    lastSolveTimeRef.current = solveTime;
    lastSolveScrambleRef.current = currentScramble;
    lastSolveSplitsRef.current = undefined;
    solveService
      .createSolve(sid, currentScramble, solveTime, penalty, null)
      .then((id) => {
        lastSolveIdRef.current = id;
        checkSolveMilestones(sid, solveTime, penalty, useSettingsStore.getState().settings);
      });
  }, []);

  const handlePress = useCallback(() => {
    if (activeModalRef.current) return;
    const prev = stateRef.current;
    dispatch({ type: "PRESS", multiphase: multiphaseRef.current });
    if (prev === TimerState.Running) {
      saveSolve();
    }
  }, [saveSolve]);

  const handleRelease = useCallback(() => {
    if (activeModalRef.current) return;
    dispatch({ type: "RELEASE", inspectionEnabled: inspectionRef.current === "15s" });
  }, []);

  pressHandlerRef.current = handlePress;
  releaseHandlerRef.current = handleRelease;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      if (activationRef.current === TimerActivation.Click) return;
      if (activeModalRef.current) return;
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "SELECT") return;
      if (target.isContentEditable) return;
      e.preventDefault();
      pressHandlerRef.current?.();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (activationRef.current === TimerActivation.Click) return;
      if (activeModalRef.current) return;
      e.preventDefault();
      releaseHandlerRef.current?.();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!shouldUsePointer(activationRef.current)) return;

    const isInTimer = (el: EventTarget | null) => {
      if (!el || !(el instanceof HTMLElement)) return false;
      return !!el.closest("[data-timer-container]");
    };

    let lastTouchTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      lastTouchTime = Date.now();
      if (!isInTimer(e.target)) return;
      if (activeModalRef.current) return;
      isTimerTouchRef.current = true;
      pressHandlerRef.current?.();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTimerTouchRef.current) return;
      isTimerTouchRef.current = false;
      if (activeModalRef.current) return;
      releaseHandlerRef.current?.();
    };

    const onTouchCancel = () => {
      isTimerTouchRef.current = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (Date.now() - lastTouchTime < 500) return;
      if (!isInTimer(e.target)) return;
      if (activeModalRef.current) return;
      e.preventDefault();
      pressHandlerRef.current?.();
    };

    const onMouseUp = (e: MouseEvent) => {
      if (Date.now() - lastTouchTime < 500) return;
      if (activeModalRef.current) return;
      e.preventDefault();
      releaseHandlerRef.current?.();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchCancel);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (state !== TimerState.Waiting) return;

    const delay = parseInt(delayRef.current, 10);
    if (isNaN(delay) || delay <= 0) {
      dispatch({ type: "START_TIMER" });
      return;
    }

    if (soundRef.current) ensureAudioCtx();

    const timeout = setTimeout(() => {
      if (soundRef.current && audioCtxRef.current) {
        beep(audioCtxRef.current, 880, 0.08, 0.15);
      }
      dispatch({ type: "START_TIMER" });
    }, delay);

    return () => clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    if (state !== TimerState.Running && state !== TimerState.Inspecting && state !== TimerState.Plus2Wait) return;

    const initialTime = time;
    startTimeRef.current = 0;
    let rafId: number;

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const prevElapsed = initialTime + elapsed;

      if (state === TimerState.Inspecting && soundRef.current) {
        const remaining = Math.max(0, INSPECTION_DURATION_MS - prevElapsed);
        const sec = Math.ceil(remaining / Time.second);
        if (sec >= 1 && sec <= 5 && sec !== lastInspectionBeepRef.current) {
          lastInspectionBeepRef.current = sec;
          ensureAudioCtx();
          beep(audioCtxRef.current, sec === 1 ? 440 : 880, 0.1, 0.12);
        }
        if (remaining <= 0 && lastInspectionBeepRef.current !== 0) {
          lastInspectionBeepRef.current = 0;
          ensureAudioCtx();
          beep(audioCtxRef.current, 330, 0.3, 0.2);
        }
      }

      dispatch({ type: "TICK", elapsed: prevElapsed });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      lastInspectionBeepRef.current = -1;
    };
  }, [state]);

  useEffect(() => {
    if (state !== TimerState.Running) return;
    if (soundRef.current) {
      ensureAudioCtx();
      beep(audioCtxRef.current, 660, 0.06, 0.12);
    }
  }, [state]);

  useEffect(() => {
    if (state !== TimerState.Stopped || !autoDnf) return;

    const sid = sessionRef.current;
    if (!sid) return;
    const solveTime = timeRef.current;
    const solveScramble = scrambleRef.current;
    setScrambleRef.current(generateScramble(eventRef.current || DEFAULT_EVENT));
    lastSolveTimeRef.current = solveTime;
    lastSolveScrambleRef.current = solveScramble;
    solveService
      .createSolve(sid, solveScramble, solveTime, Penalty.DNF)
      .then((id) => {
        lastSolveIdRef.current = id;
        checkSolveMilestones(sid, solveTime, Penalty.DNF, useSettingsStore.getState().settings);
      });
  }, [state, autoDnf]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current?.state !== "closed") {
        audioCtxRef.current?.close();
      }
      audioCtxRef.current = null;
    };
  }, []);

  const handlePenalty = useCallback((penalty: Penalty) => {
    const id = lastSolveIdRef.current;
    if (id) solveService.updateSolvePenalty(id, penalty);
    dispatch({ type: "DISMISS" });
  }, []);

  const handlePlus2 = useCallback(() => handlePenalty(Penalty.PlusTwo), [handlePenalty]);
  const handleDNF = useCallback(() => handlePenalty(Penalty.DNF), [handlePenalty]);
  const handleDelete = useCallback(() => {
    const id = lastSolveIdRef.current;
    if (id) solveService.deleteSolve(id);
    dispatch({ type: "DISMISS" });
  }, []);

  const handleManualSubmit = useCallback((ms: number) => {
    const sid = sessionRef.current;
    if (!sid) return;
    const manualScramble = scrambleRef.current;
    setScramble(generateScramble(eventRef.current || DEFAULT_EVENT));
    solveService.createSolve(sid, manualScramble, ms, null).then((id) => {
      lastSolveIdRef.current = id;
      checkSolveMilestones(sid, ms, null, useSettingsStore.getState().settings);
    });
  }, [setScramble]);

  const handleManualPreview = useCallback((text: string | null) => {
    manualPreviewRef.current = text;
  }, []);

  const inspecting = state === TimerState.Inspecting || state === TimerState.Plus2Wait;
  const inspectionRemaining = Math.max(0, INSPECTION_DURATION_MS - time);

  let displayText: string;
  let displayStyle = "";
  if (state === TimerState.Inspecting) {
    displayText = displayFromMs(inspectionRemaining);
    displayStyle = "text-accent";
  } else if (state === TimerState.Plus2Wait) {
    displayText = `+2`;
    displayStyle = "text-amber-400";
  } else if (state === TimerState.Running && hideTimeDuringSolve) {
    displayText = ``;
    displayStyle = "";
  } else if (manualEntry && state === TimerState.Idle && manualPreviewRef.current) {
    displayText = manualPreviewRef.current;
    displayStyle = "opacity-60";
  } else {
    displayText = formatMilliseconds(time);
    if (spacePressed && state === TimerState.Ready) displayStyle = "opacity-60";
    else if (state === TimerState.Stopped) displayStyle = "text-accent";
    else if (state === TimerState.Waiting) displayStyle = "opacity-60";
  }

  const showSplits = multiphase > 1 && (phases.length > 0 || (state === TimerState.Running && currentPhase > 0));

  const handleOpenNote = useCallback(() => {
    if (!lastSolveIdRef.current) return;
    openModal(ModalType.SolveDetails, {
      solveId: lastSolveIdRef.current,
      solveTime: lastSolveTimeRef.current,
      solveScramble: lastSolveScrambleRef.current,
      solvePenalty: hasPlus2Ref.current ? Penalty.PlusTwo : null,
      solveCreatedAt: undefined,
      solveNotes: "",
      solveIndex: 0,
      solveEventId: eventRef.current ?? undefined,
      solveSplits: lastSolveSplitsRef.current,
    });
  }, [openModal]);

  const usePointer = shouldUsePointer(timerActivation);
  const pressLabel = usePointer ? "Tap" : "Space";

  return (
    <div
      ref={containerRef}
      data-timer-container
      className="relative flex flex-col h-full items-center justify-center gap-6 select-none"
      style={{ touchAction: usePointer ? "none" : undefined }}
    >
      <span
        className={`text-(--timer-color) text-6xl font-bold tabular-nums transition-colors flex items-center gap-1.5 ${displayStyle}`}
      >
        {state === TimerState.Running && hideTimeDuringSolve ? (
          <span className="animate-pulse [animation-duration:2s]">?</span>
        ) : (
          displayText
        )}
      </span>

      {multiphase > 1 && state === TimerState.Running && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          Phase {currentPhase + 1} / {multiphase}
          <span className="text-muted-foreground/40">|</span>
          <span className="text-muted-foreground/60">Space to split</span>
        </div>
      )}

      {phases.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {phases.map((p, i) => (
            <PhaseSplitLabel key={i} ms={p} idx={i} />
          ))}
        </div>
      )}

      {inspecting && (
        <div className="text-xs text-muted font-medium">
          {state === TimerState.Inspecting ? `Press ${pressLabel} to start` : `Press for +2`}
        </div>
      )}

      {state === TimerState.Waiting && (
        <div className="text-xs text-muted font-medium">Press {pressLabel} to cancel</div>
      )}

      {state === TimerState.Stopped && !autoDnf && (
        <PenaltyButtons
          onPlus2={handlePlus2}
          onDNF={handleDNF}
          onNote={handleOpenNote}
          onDelete={handleDelete}
        />
      )}

      {manualEntry && (
        <ManualEntry onSubmit={handleManualSubmit} onPreview={handleManualPreview} />
      )}
    </div>
  );
};

export { Timer };
