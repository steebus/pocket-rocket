"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Icon } from "@/components/art/Icon";
import { Mascot } from "@/components/art/Mascot";
import { ButtonLink } from "@/components/ui/Button";
import { KID_COLORS } from "@/lib/kidColors";
import { usePocket } from "@/lib/store";
import styles from "./page.module.css";

const MotionLink = motion.create(Link);

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
            <MotionLink
              key={kid.id}
              href={`/kid/${kid.id}`}
              className={styles.tile}
              style={{ ["--tile" as string]: KID_COLORS[kid.color].main }}
              whileTap={reduce ? undefined : { scaleX: 1.05, scaleY: 0.92 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              aria-label={`${kid.name}, tap to play`}
            >
              <motion.span
                className={styles.mascot}
                animate={reduce ? undefined : { y: [0, -7, 0] }}
                transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.45 }}
              >
                <Mascot id={kid.mascot} color={kid.color} size="100%" />
              </motion.span>
              <span className={styles.name}>{kid.name}</span>
            </MotionLink>
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
