/**
 * Small Web Animations helpers for the "alive" touches. Every animation starts and ends at rest (no fill),
 * only moves transform / individual transform properties, and does nothing under reduced motion.
 */

export function prefersReducedMotion(): boolean {
  return typeof window === "undefined" || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

const UP = "cubic-bezier(0.16, 1, 0.3, 1)";
const DOWN = "cubic-bezier(0.45, 0, 0.9, 0.5)";

/** One little hop: lift (in em of the element) and settle exactly back. */
export function hop(el: Element, { lift = 0.06, delay = 0, duration = 380 }: { lift?: number; delay?: number; duration?: number } = {}) {
  if (prefersReducedMotion() || typeof el.animate !== "function") return;
  el.animate(
    [
      { transform: "translateY(0)", easing: UP },
      { transform: `translateY(${-lift}em)`, offset: 0.4, easing: DOWN },
      { transform: "translateY(0)" },
    ],
    { duration, delay },
  );
}

/** Positions (counted from the right) where two strings differ, so the cents digits stay put as the length changes. */
export function changedFromRight(before: string, after: string): Set<number> {
  const out = new Set<number>();
  for (let r = 0; r < after.length; r++) {
    if (before[before.length - 1 - r] !== after[after.length - 1 - r]) out.add(r);
  }
  return out;
}

/** Hop the character spans of a container left to right with a stagger. Returns the total time in ms. */
export function hopChars(
  container: Element | null,
  { step = 40, lift = 0.06, duration = 380, delay = 0, only }: { step?: number; lift?: number; duration?: number; delay?: number; only?: Set<number> } = {},
): number {
  if (!container) return 0;
  const chars = Array.from(container.children);
  let order = 0;
  chars.forEach((ch, i) => {
    if (only && !only.has(chars.length - 1 - i)) return;
    hop(ch, { lift, duration, delay: delay + order * step });
    order++;
  });
  return delay + Math.max(0, order - 1) * step + duration;
}
