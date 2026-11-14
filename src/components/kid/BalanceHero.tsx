"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/art/Icon";
import { BalanceNumber } from "@/components/ui/BalanceNumber";
import { formatCents } from "@/lib/money";
import styles from "./BalanceHero.module.css";

const MAX = 128;

/**
 * The biggest thing on the screen. Full width, never wraps, and shrinks to fit so even $999.99 stays whole.
 * `shown` is what is on screen now; `target` is where it is heading, so the size does not jump mid-count.
 */
export function BalanceHero({ shown, target, label = "in your jar", note }: { shown: number; target: number; label?: string; note?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const sizer = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number | null>(null);
  const widest = formatCents(Math.max(Math.abs(shown), Math.abs(target)));

  useLayoutEffect(() => {
    const el = box.current;
    const probe = sizer.current;
    if (!el || !probe) return;
    const fit = () => {
      const room = el.clientWidth;
      if (room <= 0) return;
      // Measure the widest text at a known size, then scale to fill the width (capped).
      probe.style.fontSize = "100px";
      const w = probe.getBoundingClientRect().width;
      if (w > 0) setSize(Math.max(36, Math.floor(Math.min(MAX, (100 * room) / (w * 1.02)))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [widest]);

  return (
    <div className={styles.hero}>
      <div ref={box} className={styles.number} style={size ? { fontSize: size } : undefined}>
        <BalanceNumber cents={shown} />
        <span ref={sizer} className={styles.sizer} aria-hidden="true" data-money>
          {widest}
        </span>
      </div>
      <p className={styles.label}>{label}</p>
      {note && (
        <p className={styles.note}>
          <Icon name="sprout" size={20} strokeWidth={3} />
          {note}
        </p>
      )}
    </div>
  );
}
