"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/art/Mascot";
import { BalanceHero } from "@/components/kid/BalanceHero";
import { Jar } from "@/components/kid/Jar";
import { InterestCelebration } from "@/components/kid/InterestCelebration";
import { JobCard } from "@/components/kid/JobCard";
import { useKid } from "@/components/kid/KidContext";
import { useJarStory } from "@/components/kid/useJarStory";
import { useIdleLoop } from "@/lib/idle";
import { formatRate, interestDue, kidInterest, PER_EVERY } from "@/lib/interest";
import { balanceOf, jobsForKid } from "@/lib/selectors";
import { sound } from "@/lib/sound";
import { usePocket } from "@/lib/store";
import styles from "./page.module.css";

export default function KidHome() {
  const kid = useKid();
  const { state, ready, actions } = usePocket();
  const reduce = useReducedMotion();
  const jobsBox = useRef<HTMLDivElement>(null);
  const turn = useRef(0);

  // Interest is paid once as the screen opens (the ref also keeps React strict mode's double effect from paying twice).
  // If at least 1c was paid, the celebration runs first; the jar is kept at its old balance until it is dismissed,
  // so the jar story then drops exactly those coins and counts up from what the child last saw.
  const [party, setParty] = useState<{ cents: number; days: number; before: number } | null>(null);
  const paid = useRef(false);
  useEffect(() => {
    if (!ready || paid.current) return;
    paid.current = true;
    const due = interestDue(state, kid.id, Date.now());
    if (due.days <= 0) return;
    const before = Math.max(0, balanceOf(state, kid.id));
    actions.payInterest(kid.id);
    if (due.cents >= 1) {
      setParty({ cents: due.cents, days: due.days, before });
      sound.cheer();
    }
  }, [ready, state, kid.id, actions]);

  const balance = Math.max(0, balanceOf(state, kid.id) - (party?.cents ?? 0));
  const story = useJarStory(kid.id, balance, kid.goal);
  const reached = !!kid.goal && balance >= kid.goal.priceCents;
  const interest = kidInterest(kid);

  // Jobs to do come first when the screen opens; cards then stay put while the child claims them.
  const rank = useRef<Map<string, number>>(new Map());
  const jobs = jobsForKid(state, kid.id, Date.now());
  for (const j of jobs) if (!rank.current.has(j.job.id)) rank.current.set(j.job.id, j.status === "todo" ? 0 : j.status === "waiting" ? 1 : 2);
  jobs.sort((a, b) => (rank.current.get(a.job.id) ?? 0) - (rank.current.get(b.job.id) ?? 0));
  const today = jobs.filter((j) => j.job.repeat !== "weekly");
  const week = jobs.filter((j) => j.job.repeat === "weekly");
  const allSettled = jobs.length > 0 && jobs.every((j) => j.status !== "todo");

  // The pictures of jobs still to do take turns giving a small "pick me" wiggle, one at a time, only the ones in view.
  const partyOpen = useRef(false);
  partyOpen.current = !!party;
  useIdleLoop(
    jobsBox,
    () => {
      if (partyOpen.current) return false;
      const room = { w: window.innerWidth, h: window.innerHeight };
      const seen = Array.from(jobsBox.current?.querySelectorAll<HTMLElement>("[data-pic][data-todo]") ?? []).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= 0 && r.right <= room.w && r.top >= 0 && r.bottom <= room.h;
      });
      if (!seen.length) return false;
      const pic = seen[turn.current++ % seen.length];
      pic.animate(
        [
          { translate: "0 0", rotate: "0deg", easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
          { translate: "0 -5px", rotate: "-8deg", offset: 0.2 },
          { translate: "0 -2px", rotate: "7deg", offset: 0.45 },
          { rotate: "-4deg", offset: 0.68 },
          { rotate: "2deg", offset: 0.85 },
          { translate: "0 0", rotate: "0deg" },
        ],
        { duration: 760, easing: "ease-in-out" },
      );
    },
    { min: 3500, max: 6000, first: [4000, 7000], exclusive: 800 },
  );

  return (
    <div className={styles.home}>
      {party && <InterestCelebration kid={kid} cents={party.cents} days={party.days} before={party.before} onDone={() => setParty(null)} />}
      <section className={styles.money} aria-labelledby="jar-title">
        <h1 id="jar-title" className={styles.sr}>
          {kid.name}&apos;s jar
        </h1>
        <BalanceHero
          shown={story.shown}
          target={balance}
          note={interest ? `Grows ${formatRate(interest.ratePercent)}% ${PER_EVERY[interest.per]}` : undefined}
        />
        <Jar
          pileCoins={story.pileCoins}
          drop={story.drop}
          stagger={story.stagger}
          celebrate={story.celebrate}
          goal={kid.goal}
          reached={reached}
        />
      </section>

      <div ref={jobsBox} className={styles.jobs}>
        {jobs.length === 0 && (
          <div className={styles.happy}>
            <Mascot id={kid.mascot} color={kid.color} size={96} alive />
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
              <Mascot id={kid.mascot} color={kid.color} size="100%" alive />
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
