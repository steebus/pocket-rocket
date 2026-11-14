"use client";

import { motion, useReducedMotion } from "motion/react";
import { Mascot } from "@/components/art/Mascot";
import { BalanceHero } from "@/components/kid/BalanceHero";
import { Jar } from "@/components/kid/Jar";
import { JobCard } from "@/components/kid/JobCard";
import { useKid } from "@/components/kid/KidContext";
import { useJarStory } from "@/components/kid/useJarStory";
import { balanceOf, jobsForKid } from "@/lib/selectors";
import { usePocket } from "@/lib/store";
import styles from "./page.module.css";

export default function KidHome() {
  const kid = useKid();
  const { state } = usePocket();
  const reduce = useReducedMotion();

  const balance = Math.max(0, balanceOf(state, kid.id));
  const story = useJarStory(kid.id, balance, kid.goal);
  const reached = !!kid.goal && balance >= kid.goal.priceCents;

  const jobs = jobsForKid(state, kid.id, Date.now());
  const today = jobs.filter((j) => j.job.repeat !== "weekly");
  const week = jobs.filter((j) => j.job.repeat === "weekly");
  const allSettled = jobs.length > 0 && jobs.every((j) => j.status !== "todo");

  return (
    <div className={styles.home}>
      <section className={styles.money} aria-labelledby="jar-title">
        <h1 id="jar-title" className={styles.sr}>
          {kid.name}&apos;s jar
        </h1>
        <BalanceHero shown={story.shown} target={balance} />
        <Jar
          pileCoins={story.pileCoins}
          drop={story.drop}
          stagger={story.stagger}
          celebrate={story.celebrate}
          goal={kid.goal}
          reached={reached}
        />
      </section>

      <div className={styles.jobs}>
        {jobs.length === 0 && (
          <div className={styles.happy}>
            <Mascot id={kid.mascot} color={kid.color} size={96} />
            <p>No jobs yet. Ask a grown-up what you can do!</p>
          </div>
        )}

        {allSettled && (
          <div className={styles.happy}>
            <motion.span
              className={styles.happyFace}
              animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
              transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mascot id={kid.mascot} color={kid.color} size="100%" />
            </motion.span>
            <p>
              All done for now!
              <span> Great work, {kid.name}.</span>
            </p>
          </div>
        )}

        {today.length > 0 && (
          <section aria-labelledby="today-title">
            <h2 id="today-title" className={styles.heading}>
              Jobs for today
            </h2>
            <ul className={styles.row}>
              {today.map((j, i) => (
                <JobCard key={j.job.id} job={j.job} status={j.status} kidId={kid.id} index={i} />
              ))}
            </ul>
          </section>
        )}

        {week.length > 0 && (
          <section aria-labelledby="week-title">
            <h2 id="week-title" className={styles.heading}>
              This week
            </h2>
            <ul className={styles.row}>
              {week.map((j, i) => (
                <JobCard key={j.job.id} job={j.job} status={j.status} kidId={kid.id} index={i + today.length} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
