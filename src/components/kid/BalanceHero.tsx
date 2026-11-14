"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BalanceNumber } from "@/components/ui/BalanceNumber";
import { formatCents } from "@/lib/money";
import styles from "./BalanceHero.module.css";

let canvas: CanvasRenderingContext2D | null = null;

/** Width of a string in em, measured with the real display font. */
function emWidth(text: string): number {
  try {
    canvas ??= document.createElement("canvas").getContext("2d");
    if (!canvas) return text.length * 0.66;
    canvas.font = '900 100px "Grandstander Variable", "Comic Sans MS", system-ui, sans-serif';
    return canvas.measureText(text).width / 100;
  } catch {
    return text.length * 0.66;
  }
}

/**
 * The biggest thing on the screen. Full width, never wraps, and shrinks to fit so even $999.99 stays whole.
 * `shown` is what is on screen now; `target` is where it is heading, so the size does not jump mid-count.
 */
export function BalanceHero({ shown, target, label = "in your jar" }: { shown: number; target: number; label?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number | null>(null);
  const widest = formatCents(Math.max(Math.abs(shown), Math.abs(target)));

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const want = Math.min(120, Math.max(64, window.innerWidth * 0.22));
      const room = el.clientWidth;
      if (room <= 0) return;
      setSize(Math.floor(Math.min(want, room / (emWidth(widest) * 1.05))));
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
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
