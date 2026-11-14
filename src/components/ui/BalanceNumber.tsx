"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { changedFromRight, hopChars } from "@/lib/hop";
import { useIdleLoop } from "@/lib/idle";
import { formatCents } from "@/lib/money";
import styles from "./BalanceNumber.module.css";

/**
 * Formatted money that counts to its new value over ~600ms, then pops. Renders the real value on first paint.
 * `lively` sets it as separate characters: they hop in left to right on arrival, the ones that change get a small bump
 * when the value changes, and every so often a soft wave passes through. `waveOk` lets the caller hold the wave back
 * (for example while coins are still landing).
 */
export function BalanceNumber({
  cents,
  className,
  lively = false,
  waveOk = true,
}: {
  cents: number;
  className?: string;
  lively?: boolean;
  waveOk?: boolean;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(cents);
  const shownRef = useRef(cents);
  const el = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const prevTarget = useRef(cents);
  const waveOkRef = useRef(waveOk);
  waveOkRef.current = waveOk;

  useEffect(() => {
    if (shownRef.current === cents) return;
    if (reduce) {
      shownRef.current = cents;
      setShown(cents);
      return;
    }
    const counter = animate(shownRef.current, cents, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => {
        const r = Math.round(v);
        shownRef.current = r;
        setShown(r);
      },
      onComplete: () => {
        shownRef.current = cents;
        setShown(cents);
        // The lively number bumps its own digits instead of popping as a whole.
        if (!lively && el.current) animate(el.current, { scale: [1, 1.14, 1] }, { duration: 0.3, ease: "easeOut" });
      },
    });
    return () => counter.stop();
  }, [cents, reduce, lively]);

  // Arrival: the characters are already there; each takes a little hop, left to right (~580ms in all).
  useEffect(() => {
    if (!lively) return;
    hopChars(el.current, { step: 35, lift: 0.09, duration: 340 });
  }, [lively]);

  // A change: bump only the characters whose value changed, without touching the count.
  useEffect(() => {
    const before = prevTarget.current;
    prevTarget.current = cents;
    if (!lively || before === cents) return;
    hopChars(el.current, { step: 30, lift: 0.04, duration: 280, only: changedFromRight(formatCents(before), formatCents(cents)) });
  }, [cents, lively]);

  // Idle: a soft wave left to right, only when the number is at rest.
  useIdleLoop(
    root,
    () => {
      if (!waveOkRef.current || shownRef.current !== prevTarget.current) return false;
      hopChars(el.current, { step: 70, lift: 0.055, duration: 560 });
    },
    { min: 7000, max: 10000, first: [4500, 7000], exclusive: 1300, enabled: lively },
  );

  const text = formatCents(shown);
  return (
    <span ref={root} className={[styles.num, className].filter(Boolean).join(" ")} data-money>
      <span className={styles.sr}>{formatCents(cents)}</span>
      <span ref={el} aria-hidden="true" style={{ display: "inline-block", transformOrigin: "left center" }}>
        {lively
          ? Array.from(text).map((c, i) => (
              // Keyed from the right so the cents digits keep their element when the number grows a digit.
              <span key={text.length - 1 - i} className={styles.ch}>
                {c}
              </span>
            ))
          : text}
      </span>
    </span>
  );
}
