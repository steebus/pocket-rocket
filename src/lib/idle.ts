"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";

/*
 * Idle life. Everything that moves by itself on a screen goes through here so that:
 *  - only one idle thing moves at a time (a shared "busy until" clock),
 *  - nothing runs while the tab is hidden or the element is off screen,
 *  - nothing runs at all under reduced motion.
 */

let busyUntil = 0;
const now = () => (typeof performance === "undefined" ? 0 : performance.now());

export const idleBusy = () => now() < busyUntil;

/** Mark the screen as busy for `ms` plus a short breather, so the next idle thing waits its turn. */
export function holdIdle(ms: number) {
  busyUntil = Math.max(busyUntil, now() + ms + 600);
}

interface IdleOptions {
  /** ms between runs */
  min: number;
  max: number;
  /** ms before the first run (default: min..max) */
  first?: [number, number];
  /** take the shared idle slot for this long; if another idle thing holds it, wait */
  exclusive?: number;
  enabled?: boolean;
}

/**
 * Call `run` at random intervals while `ref` is on screen and the tab is visible.
 * `run` may return false to say "nothing to do this time" (the slot is then not taken).
 */
export function useIdleLoop(ref: RefObject<Element | null>, run: () => void | boolean, opts: IdleOptions) {
  const reduce = useReducedMotion();
  const runRef = useRef(run);
  runRef.current = run;
  const { min, max, exclusive = 0, enabled = true } = opts;
  const f0 = opts.first?.[0];
  const f1 = opts.first?.[1];

  useEffect(() => {
    if (!enabled || reduce) return;
    let timer = 0;
    let armed = false;
    let onScreen = true;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const active = () => !document.hidden && onScreen;

    const arm = (ms: number) => {
      window.clearTimeout(timer);
      armed = true;
      timer = window.setTimeout(tick, ms);
    };
    const disarm = () => {
      window.clearTimeout(timer);
      armed = false;
    };
    const sync = () => {
      if (!active()) disarm();
      else if (!armed) arm(rand(f0 ?? min, f1 ?? max));
    };

    function tick() {
      armed = false;
      if (!active()) return;
      if (exclusive && idleBusy()) {
        arm(rand(900, 1800));
        return;
      }
      const result = runRef.current();
      if (exclusive && result !== false) holdIdle(exclusive);
      arm(result === false ? rand(1500, 2500) : rand(min, max));
    }

    const el = ref.current;
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
        sync();
      });
      io.observe(el);
    }
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disarm();
      io?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref, enabled, reduce, min, max, exclusive, f0, f1]);
}
