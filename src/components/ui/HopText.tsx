"use client";

import { useEffect, useRef } from "react";
import { hopChars } from "@/lib/hop";
import styles from "./BalanceNumber.module.css";

/** Text set as separate characters that settle in left to right with a short hop when they first appear. */
export function HopText({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    hopChars(box.current, { step: 45, lift: 0.07, duration: 360, delay });
  }, [delay]);
  return (
    <span ref={box} className={className} aria-hidden="true">
      {Array.from(text).map((c, i) => (
        <span key={i} className={styles.ch}>
          {c}
        </span>
      ))}
    </span>
  );
}
