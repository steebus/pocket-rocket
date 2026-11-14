"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/art/Icon";
import { Mascot } from "@/components/art/Mascot";
import { ButtonLink } from "@/components/ui/Button";
import { KID_COLORS } from "@/lib/kidColors";
import { usePocket } from "@/lib/store";
import type { Kid } from "@/lib/types";
import styles from "./page.module.css";

const MotionLink = motion.create(Link);

/** One face to tap. The moment a finger lands, the character's eyes go wide; navigation is not held up. */
function Tile({ kid, index, reduce }: { kid: Kid; index: number; reduce: boolean }) {
  const [wide, setWide] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const surprise = () => {
    setWide(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setWide(false), 900);
  };
  return (
    <MotionLink
      href={`/kid/${kid.id}`}
      className={styles.tile}
      style={{ ["--tile" as string]: KID_COLORS[kid.color].main }}
      whileTap={reduce ? undefined : { scaleX: 1.05, scaleY: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      aria-label={`${kid.name}, tap to play`}
      onPointerDown={surprise}
      onKeyDown={(e) => {
        if (e.key === "Enter") surprise();
      }}
    >
      <motion.span
        className={styles.mascot}
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.45 }}
      >
        <Mascot id={kid.mascot} color={kid.color} size="100%" alive look={wide ? "wide" : undefined} />
      </motion.span>
      <span className={styles.name}>{kid.name}</span>
    </MotionLink>
  );
}

export default function WhosPlaying() {
  const { state, ready } = usePocket();
  const reduce = useReducedMotion();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Who&apos;s playing?</h1>

      {!ready ? (
        <div className={styles.quiet} aria-hidden="true" />
      ) : state.kids.length === 0 ? (
        <div className={styles.grid}>
          <p className={styles.empty}>No one is here yet. A grown-up can add the family.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {state.kids.map((kid, i) => (
            <Tile key={kid.id} kid={kid} index={i} reduce={!!reduce} />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <ButtonLink href="/parent" variant="plain" size="lg" pill>
          <Icon name="lock" size={24} />
          Parents
        </ButtonLink>
      </div>
    </main>
  );
}
