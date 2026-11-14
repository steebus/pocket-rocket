"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Mascot } from "@/components/art/Mascot";
import { Button } from "@/components/ui/Button";
import { HopText } from "@/components/ui/HopText";
import { KID_COLORS } from "@/lib/kidColors";
import { formatCents, formatShort } from "@/lib/money";
import type { Kid } from "@/lib/types";
import styles from "./InterestCelebration.module.css";

/** A coin drawn at (cx, cy) with radius r, on the same 48-unit recipe as the Coin component. Outlines stay 4px. */
function CoinDisc({ cx, cy, r, className }: { cx: number; cy: number; r: number; className?: string }) {
  const k = r / 21;
  return (
    <g className={className} transform={`translate(${cx - 24 * k} ${cy - 24 * k}) scale(${k})`}>
      <circle cx="24" cy="24" r="21" fill="var(--gold)" stroke="var(--ink)" strokeWidth={4} vectorEffect="non-scaling-stroke" />
      <path d="M38 12a17 17 0 0 1-23 25 17 17 0 0 0 23-25z" fill="var(--gold-shade)" />
      <text x="24" y="31.5" textAnchor="middle" fontFamily="var(--font)" fontWeight={900} fontSize="22" fill="var(--ink)">
        $
      </text>
    </g>
  );
}

/** A coin that sprouts: a stem climbs out of a big coin and grows coin leaves. Authored SVG, all flat fills. */
function Sprout() {
  const stem = "M110 112C110 92 108 76 110 52";
  const left = "M109 96C98 96 88 92 80 84";
  const right = "M110 80C124 78 136 72 144 62";
  return (
    <svg className={styles.sprout} viewBox="0 0 220 200" aria-hidden="true" focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        <g className={styles.stem}>
          <path d={stem} stroke="var(--ink)" strokeWidth="13" />
          <path d={left} stroke="var(--ink)" strokeWidth="11" />
          <path d={right} stroke="var(--ink)" strokeWidth="11" />
          <path d={stem} stroke="var(--ok)" strokeWidth="5" />
          <path d={left} stroke="var(--ok)" strokeWidth="4" />
          <path d={right} stroke="var(--ok)" strokeWidth="4" />
        </g>
      </g>
      <CoinDisc cx={62} cy={74} r={23} className={styles.leafA} />
      <CoinDisc cx={158} cy={52} r={23} className={styles.leafB} />
      <CoinDisc cx={110} cy={34} r={27} className={styles.leafTop} />
      <g className={styles.base}>
        <path d="M42 176c6-8 20-12 68-12s62 4 68 12" fill="var(--white)" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <CoinDisc cx={110} cy={146} r={34} />
      </g>
    </svg>
  );
}

const FOCUSABLE = "button:not([disabled]),a[href],input,select,textarea,[tabindex]:not([tabindex='-1'])";

/**
 * The full-screen "Your money grew!" moment. A real dialog: focus moves to the one button and stays there,
 * Enter or Escape dismiss it. Under reduced motion the same content shows with no movement (CSS handles it).
 */
export function InterestCelebration({
  kid,
  cents,
  days,
  before,
  onDone,
}: {
  kid: Kid;
  cents: number;
  days: number;
  /** the jar balance before the interest */
  before: number;
  onDone: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const color = KID_COLORS[kid.color];
  const amount = `+${formatShort(cents)}`;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const getButton = () => panel.current?.querySelector<HTMLButtonElement>("button") ?? null;
    getButton()?.focus();

    const finish = () => {
      if (done.current) return;
      done.current = true;
      onDoneRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "Enter" && document.activeElement !== getButton()) {
        e.preventDefault();
        finish();
      } else if (e.key === "Tab") {
        // One control inside: keep focus on it.
        const items = panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!items || items.length <= 1) {
          e.preventDefault();
          getButton()?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  const line = `You kept ${formatCents(before)} in your jar, so ${days > 1 ? `in ${days} days ` : ""}it grew by ${formatShort(cents)}.`;

  return createPortal(
    <div
      className={styles.overlay}
      style={{ ["--kid" as string]: color.main, ["--kid-ground" as string]: color.ground }}
    >
      <div
        ref={panel}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="grew-title"
        aria-describedby="grew-line"
      >
        <div className={styles.art}>
          <span className={styles.mascot}>
            <Mascot id={kid.mascot} color={kid.color} size="100%" alive />
          </span>
          <Sprout />
        </div>
        <h2 id="grew-title" className={styles.title}>
          Your money grew!
        </h2>
        <p className={styles.amount} style={{ ["--len" as string]: amount.length }} data-money aria-label={`${formatShort(cents)} more`}>
          <HopText text={amount} delay={700} />
        </p>
        <p id="grew-line" className={styles.line}>
          {line}
        </p>
        <Button variant="ok" size="kid" pill className={styles.go} onClick={() => {
            if (done.current) return;
            done.current = true;
            onDoneRef.current();
          }}>
          Put it in my jar
        </Button>
      </div>
    </div>,
    document.body,
  );
}
