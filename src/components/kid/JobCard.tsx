"use client";

import { motion, useAnimate, useReducedMotion } from "motion/react";
import { Icon } from "@/components/art/Icon";
import { JobIcon } from "@/components/art/JobIcon";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { formatShort } from "@/lib/money";
import { sound } from "@/lib/sound";
import { speak } from "@/lib/speak";
import { usePocket } from "@/lib/store";
import type { Job, JobStatus } from "@/lib/types";
import styles from "./JobCard.module.css";

const TINTS = ["var(--tint-coral)", "var(--tint-violet)", "var(--tint-gold)"];

export function JobCard({ job, status, kidId, index }: { job: Job; status: JobStatus; kidId: string; index: number }) {
  const { actions } = usePocket();
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();

  function claim() {
    sound.pop();
    actions.claimJob(kidId, job.id);
    if (!reduce && scope.current) {
      void animate(scope.current, { scaleX: [1, 1.07, 0.97, 1], scaleY: [1, 0.88, 1.04, 1] }, { duration: 0.55, ease: "easeOut" });
    }
  }

  return (
    <li
      ref={scope}
      className={styles.card}
      data-status={status}
      style={{ ["--tint" as string]: status === "done" ? "var(--white)" : TINTS[index % TINTS.length] }}
    >
      <button type="button" className={styles.say} onClick={() => speak(job.name)} aria-label={`Hear it: ${job.name}`}>
        <span className={styles.speaker} aria-hidden="true">
          <Icon name="speaker" size={26} strokeWidth={4} />
        </span>
        <span className={styles.pic}>
          <JobIcon id={job.icon} size="100%" />
          {status === "done" && (
            <motion.span
              className={styles.stamp}
              data-kind="done"
              initial={reduce ? false : { scale: 0.4, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 14 }}
            >
              <Icon name="check" size={30} strokeWidth={5} />
            </motion.span>
          )}
          {status === "waiting" && (
            <motion.span
              className={styles.stamp}
              data-kind="waiting"
              initial={reduce ? false : { scale: 0.4, rotate: 25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 14 }}
            >
              <Icon name="clock" size={32} strokeWidth={4} />
            </motion.span>
          )}
        </span>
        <span className={styles.name}>{job.name}</span>
      </button>

      <span className={styles.chip}>
        <Coin size={26} />
        {formatShort(job.valueCents)}
      </span>

      {status === "todo" && (
        <Button variant="ok" size="kid" pill className={styles.did} onClick={claim}>
          I did it!
        </Button>
      )}
      {status === "waiting" && (
        <motion.p
          className={styles.state}
          data-kind="waiting"
          initial={reduce ? false : { scale: 0.85, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
        >
          <Icon name="clock" size={26} />
          <span>Waiting for a <span style={{ whiteSpace: "nowrap" }}>grown-up</span></span>
        </motion.p>
      )}
      {status === "done" && (
        <p className={styles.state} data-kind="done">
          <Icon name="check" size={26} strokeWidth={5} />
          <span>Done!</span>
        </p>
      )}
    </li>
  );
}
