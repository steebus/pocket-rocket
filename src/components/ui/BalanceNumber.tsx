"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatCents } from "@/lib/money";
import styles from "./BalanceNumber.module.css";

/** Formatted money that counts to its new value over ~600ms, then pops. Renders the real value on first paint. */
export function BalanceNumber({ cents, className }: { cents: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(cents);
  const shownRef = useRef(cents);
  const el = useRef<HTMLSpanElement>(null);

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
        if (el.current) animate(el.current, { scale: [1, 1.14, 1] }, { duration: 0.3, ease: "easeOut" });
      },
    });
    return () => counter.stop();
  }, [cents, reduce]);

  return (
    <span className={[styles.num, className].filter(Boolean).join(" ")} data-money>
      <span className={styles.sr}>{formatCents(cents)}</span>
      <span ref={el} aria-hidden="true" style={{ display: "inline-block", transformOrigin: "left center" }}>
        {formatCents(shown)}
      </span>
    </span>
  );
}
