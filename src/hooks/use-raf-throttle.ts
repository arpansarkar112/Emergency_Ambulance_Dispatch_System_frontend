"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Throttles high-frequency event callbacks (e.g. virtual scroll, mouse move, resize)
 * to execute at most once per animation frame (16.67ms @ 60Hz) using `requestAnimationFrame`
 * and mutable `useRef` state so intermediate frames do not trigger React re-renders.
 */
export function useRafThrottle<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void
): (...args: TArgs) => void {
  const callbackRef = useRef(callback);
  const rafIdRef = useRef<number | null>(null);
  const latestArgsRef = useRef<TArgs | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return useCallback((...args: TArgs) => {
    latestArgsRef.current = args;
    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (latestArgsRef.current) {
        callbackRef.current(...latestArgsRef.current);
      }
    });
  }, []);
}
