"use client";

import { motion, useReducedMotion } from "motion/react";
import { GoalIcon } from "@/components/art/GoalIcon";
import { Icon } from "@/components/art/Icon";
import { Mascot } from "@/components/art/Mascot";
import { Jar } from "@/components/kid/Jar";
import { useKid } from "@/components/kid/KidContext";
import { useJarStory } from "@/components/kid/useJarStory";
import { formatCents, formatShort } from "@/lib/money";
import { balanceOf } from "@/lib/selectors";
import { speak } from "@/lib/speak";
import { usePocket } from "@/lib/store";
import styles from "./page.module.css";

export default function KidGoal() {
  const kid = useKid();
  const { state } = usePocket();
  const reduce = useReducedMotion();
  const balance = Math.max(0, balanceOf(state, kid.id));
  const story = useJarStory(kid.id, balance, kid.goal);

  if (!kid.goal) {
    return (
      <div className={styles.none}>
        <motion.span
          className={styles.noneFace}
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mascot id={kid.mascot} color={kid.color} size="100%" />
        </motion.span>
        <h1>What are you saving for?</h1>
        <p>Ask a grown-up to pick something special for you to save up for.</p>
        <span className={styles.gift} aria-hidden="true">
          <Icon name="gift" size={64} />
        </span>
      </div>
    );
  }

  const goal = kid.goal;
  const reached = balance >= goal.priceCents;
  const left = Math.max(0, goal.priceCents - balance);

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="goal-title">
        <div className={styles.say}>
          <button type="button" className={styles.picBtn} onClick={() => speak(goal.name)} aria-label={`Hear it: ${goal.name}`}>
            <span className={styles.pic}>
              <GoalIcon id={goal.icon} size="100%" />
            </span>
            <span className={styles.speaker} aria-hidden="true">
              <Icon name="speaker" size={26} />
            </span>
          </button>
          <h1 id="goal-title" className={styles.name}>
            <button type="button" className={styles.nameBtn} onClick={() => speak(goal.name)}>
              {goal.name}
            </button>
          </h1>
        </div>
        <p className={styles.price}>
          <span className={styles.priceChip} data-money>
            {formatCents(goal.priceCents)}
          </span>
        </p>

        {reached ? (
          <div className={styles.win}>
            <p className={styles.winTitle}>You did it!</p>
            <p>You have enough for your {goal.name}. Tell a grown-up!</p>
          </div>
        ) : (
          <div className={styles.left}>
            <p className={styles.leftNum} data-money>
              {formatCents(left)}
              <span> to go</span>
            </p>
            <p className={styles.saved}>
              <Icon name="coin" size={26} />
              <span data-money>{formatCents(balance)}</span> saved
            </p>
          </div>
        )}
      </section>

      <section className={styles.jarBox} aria-label="Your savings jar">
        <Jar
          pileCoins={story.pileCoins}
          drop={story.drop}
          stagger={story.stagger}
          celebrate={story.celebrate}
          goal={goal}
          reached={reached}
        />
        <p className={styles.hint}>
          {reached ? `The line is ${formatShort(goal.priceCents)}. Your coins are over it!` : "Fill the jar up to the dashed line."}
        </p>
      </section>
    </div>
  );
}
