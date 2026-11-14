"use client";

import { motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/art/Mascot";
import { kidSignals } from "@/lib/kidSignals";
import type { Kid } from "@/lib/types";
import styles from "./KidFace.module.css";

/**
 * The mascot in the top bar. It blinks, and it answers what the child does: a small happy hop with a
 * squeezed-shut smile when a job is claimed, a bigger one when coins land in the jar. Under reduced
 * motion the smile still shows (an instant state change) and the hop is skipped.
 */
export function KidFace({ kid }: { kid: Kid }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const [happy, setHappy] = useState(false);
  const hopping = useRef(false);
  const calm = useRef(0);

  useEffect(() => {
    const off = kidSignals.on((signal) => {
      setHappy(true);
      window.clearTimeout(calm.current);
      calm.current = window.setTimeout(() => setHappy(false), signal === "coins" ? 1100 : 800);
      if (reduce || hopping.current || !scope.current) return;
      hopping.current = true;
      // The bar sits at the very top of the screen, so the hop stays small and gets its size from squash and wiggle.
      const keys =
        signal === "coins"
          ? { y: [0, -12, 0, -4, 0], rotate: [0, -7, 6, -3, 0], scaleY: [1, 1.1, 0.88, 1.02, 1], scaleX: [1, 0.94, 1.08, 1, 1] }
          : { y: [0, -7, 0, -2, 0], scaleY: [1, 1.06, 0.92, 1, 1], scaleX: [1, 0.96, 1.05, 1, 1] };
      void animate(scope.current, keys, { duration: signal === "coins" ? 0.7 : 0.5, ease: "easeOut" }).then(() => {
        hopping.current = false;
      });
    });
    return () => {
      off();
      window.clearTimeout(calm.current);
    };
  }, [reduce, animate, scope]);

  return (
    <motion.span
      className={styles.face}
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={reduce ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <span ref={scope} className={styles.reactor}>
        <Mascot id={kid.mascot} color={kid.color} size="100%" alive look={happy ? "happy" : undefined} />
      </span>
    </motion.span>
  );
}
