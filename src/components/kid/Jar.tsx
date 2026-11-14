"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import { GoalIcon } from "@/components/art/GoalIcon";
import { Icon } from "@/components/art/Icon";
import { Coin } from "@/components/ui/Coin";
import { formatShort } from "@/lib/money";
import type { Goal } from "@/lib/types";
import { COIN, jarHeight, lineY, slotOf } from "./jarMath";
import styles from "./Jar.module.css";

const FALL_KEYS = ["-720%", "0%", "-34%", "0%", "-9%", "0%"];
const FALL_TIMES = [0, 0.5, 0.67, 0.81, 0.92, 1];

function CoinInPile({
  index,
  falls,
  delay,
  reduce,
}: {
  index: number;
  falls: boolean;
  delay: number;
  reduce: boolean;
}) {
  const slot = slotOf(index);
  const style: CSSProperties = {
    left: `calc(${slot.x}% - ${COIN / 2}cqw)`,
    bottom: `${slot.y}cqw`,
    zIndex: slot.row + 1,
  };
  if (reduce || !falls) {
    return (
      <motion.span
        className={styles.coin}
        style={style}
        initial={false}
        animate={{ y: "0%", rotate: slot.tilt }}
        exit={reduce ? { opacity: 0, transition: { duration: 0.01 } } : { y: "-620%", opacity: 0, transition: { duration: 0.34, ease: "easeIn" } }}
      >
        <Coin size={100} style={{ width: "100%", height: "100%" }} />
      </motion.span>
    );
  }
  return (
    <motion.span
      className={styles.coin}
      style={style}
      initial={{ y: "-720%", rotate: slot.tilt - 140 }}
      animate={{ y: FALL_KEYS, rotate: slot.tilt }}
      exit={{ y: "-620%", opacity: 0, transition: { duration: 0.34, ease: "easeIn" } }}
      transition={{
        y: { duration: 0.95, times: FALL_TIMES, ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"], delay },
        rotate: { type: "spring", stiffness: 160, damping: 11, delay },
      }}
    >
      <Coin size={100} style={{ width: "100%", height: "100%" }} />
    </motion.span>
  );
}

const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + 0.2;
  const far = 330 + (i % 3) * 90;
  return { x: Math.cos(a) * far, y: Math.sin(a) * far - 120, star: i % 2 === 0, delay: (i % 4) * 0.04 };
});

function Burst({ at }: { at: number }) {
  return (
    <div className={styles.burst} style={{ ["--y" as string]: at } as CSSProperties} aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={styles.particle}
          initial={{ x: "0%", y: "0%", scale: 0.3, opacity: 1 }}
          animate={{ x: `${p.x}%`, y: `${p.y}%`, scale: [0.3, 1.15, 0.9], opacity: [1, 1, 0] }}
          transition={{ duration: 1.25, delay: p.delay, ease: "easeOut", opacity: { times: [0, 0.7, 1], duration: 1.25, delay: p.delay } }}
        >
          {p.star ? <Icon name="star" size="100%" strokeWidth={3} /> : <Coin size={100} style={{ width: "100%", height: "100%" }} />}
        </motion.span>
      ))}
    </div>
  );
}

export interface JarProps {
  pileCoins: number;
  drop: { id: number; from: number };
  stagger: number;
  celebrate: number;
  goal?: Goal;
  /** the goal is met right now */
  reached?: boolean;
  className?: string;
}

/** Wide glass jar, gold coin pile, and the goal as a dashed line at the height the pile reaches when it is met. */
export function Jar({ pileCoins, drop, stagger, celebrate, goal, reached, className }: JarProps) {
  const reduce = !!useReducedMotion();
  const [party, setParty] = useState(false);

  useEffect(() => {
    if (!celebrate) return;
    setParty(true);
    const t = window.setTimeout(() => setParty(false), 1800);
    return () => window.clearTimeout(t);
  }, [celebrate]);

  const h = jarHeight(goal);
  const y = goal ? lineY(goal) : 0;
  const coins = Array.from({ length: pileCoins }, (_, i) => i);

  return (
    <motion.div
      className={[styles.jar, className].filter(Boolean).join(" ")}
      style={{ ["--h" as string]: h, ["--y" as string]: y } as CSSProperties}
      animate={party && !reduce ? { rotate: [0, -2.4, 2.4, -1.8, 1.8, 0], scale: [1, 1.03, 1] } : { rotate: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      role="img"
      aria-label={
        goal
          ? reached
            ? `A jar full of coins. You have enough for your ${goal.name}.`
            : `A jar of coins, saving for your ${goal.name}.`
          : "A jar of coins."
      }
    >
      <span className={styles.lid} />
      <div className={styles.glass}>
        <span className={styles.shine} />
        {goal && <span className={styles.line} />}
        <div className={styles.layer}>
          <AnimatePresence initial={false}>
            {coins.map((i) => {
              const falls = i >= drop.from;
              return (
                <CoinInPile
                  key={falls ? `${i}-${drop.id}` : `${i}`}
                  index={i}
                  falls={falls}
                  delay={(i - drop.from) * stagger}
                  reduce={reduce}
                />
              );
            })}
          </AnimatePresence>
        </div>
        {goal && (
          <span className={styles.tag} data-reached={reached ? "yes" : undefined}>
            <GoalIcon id={goal.icon} size="1.9rem" />
            <span className={styles.price}>{formatShort(goal.priceCents)}</span>
            {reached && <Icon name="check" size="1.2rem" />}
          </span>
        )}
      </div>
      {party && !reduce && goal && <Burst at={y} />}
    </motion.div>
  );
}
