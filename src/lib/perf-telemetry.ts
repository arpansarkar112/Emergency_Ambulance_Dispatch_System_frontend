"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";

export interface ProfilerMetricEntry {
  id: string;
  commits: number;
  lastPhase: "mount" | "update" | "nested-update";
  lastActualDurationMs: number;
  lastBaseDurationMs: number;
  avgActualDurationMs: number;
  totalActualDurationMs: number;
}

type Listener = () => void;

const metricsMap = new Map<string, ProfilerMetricEntry>();
const listeners = new Set<Listener>();
let snapshotCache: ProfilerMetricEntry[] = [];

function emitChange() {
  snapshotCache = Array.from(metricsMap.values());
  for (const listener of listeners) {
    listener();
  }
}

/**
 * External store recorder for React `<Profiler onRender={recordProfilerCommit}>`.
 * Stores commit telemetry outside React state so recording profiler timings never
 * triggers cascading re-renders in the main dashboard component tree.
 */
export function recordProfilerCommit(
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number
) {
  const prev = metricsMap.get(id);
  const commits = (prev?.commits ?? 0) + 1;
  const totalActual = (prev?.totalActualDurationMs ?? 0) + actualDuration;
  const entry: ProfilerMetricEntry = {
    id,
    commits,
    lastPhase: phase,
    lastActualDurationMs: Number(actualDuration.toFixed(2)),
    lastBaseDurationMs: Number(baseDuration.toFixed(2)),
    avgActualDurationMs: Number((totalActual / commits).toFixed(2)),
    totalActualDurationMs: Number(totalActual.toFixed(2)),
  };
  metricsMap.set(id, entry);

  if (typeof window !== "undefined") {
    (
      window as unknown as {
        __REACT_PROFILER_METRICS__?: Record<string, ProfilerMetricEntry>;
      }
    ).__REACT_PROFILER_METRICS__ = Object.fromEntries(metricsMap.entries());
  }

  if (listeners.size > 0) {
    emitChange();
  } else {
    snapshotCache = Array.from(metricsMap.values());
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshotCache;
}

const SERVER_SNAPSHOT: ProfilerMetricEntry[] = [];
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useProfilerTelemetry(): ProfilerMetricEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Production-compatible commit timer using `useLayoutEffect`, `useEffect`, and `useRef`
 * that complies with React 19 purity rules while recording mount/update commit durations.
 */
export function useRenderTelemetry(id: string) {
  const commitStartRef = useRef<number>(0);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    commitStartRef.current =
      typeof performance !== "undefined" ? performance.now() : 0;
  });

  useEffect(() => {
    const duration =
      typeof performance !== "undefined" && commitStartRef.current > 0
        ? Math.max(0.05, performance.now() - commitStartRef.current)
        : 0.1;
    const phase = mountedRef.current ? "update" : "mount";
    mountedRef.current = true;
    recordProfilerCommit(id, phase, duration, duration);
  });
}
