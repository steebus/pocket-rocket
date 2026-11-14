"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/art/Icon";
import { JobIcon } from "@/components/art/JobIcon";
import { Mascot } from "@/components/art/Mascot";
import { MoneySheet, type MoneyMode } from "@/components/parent/MoneySheet";
import ui from "@/components/parent/ui.module.css";
import { BalanceNumber } from "@/components/ui/BalanceNumber";
import { ButtonLink } from "@/components/ui/Button";
import { formatRate, kidInterest, PER_LABEL } from "@/lib/interest";
import { formatCents, formatShort } from "@/lib/money";
import { balanceOf, goalProgress, streakOf, waitingClaims } from "@/lib/selectors";
import { sound } from "@/lib/sound";
import { usePocket } from "@/lib/store";
import styles from "./page.module.css";

export default function Dashboard() {
  const { state, actions } = usePocket();
  const reduce = useReducedMotion();
  const [sheet, setSheet] = useState<{ kidId: string; mode: MoneyMode; open: boolean } | null>(null);
  const waiting = waitingClaims(state);
  const now = Date.now();

  const subLine = (kidId: string): string => {
    const g = goalProgress(state, kidId);
    if (g) return `${g.goal.name}: ${formatCents(g.savedCents)} of ${formatShort(g.goal.priceCents)}`;
    const streak = streakOf(state, kidId, now);
    return streak > 0 ? `${streak} day streak` : "No streak yet";
  };

  return (
    <div className={styles.dash}>
      <section className={ui.section} aria-labelledby="waiting-h">
        <h2 className={ui.h2} id="waiting-h">
          Waiting for you
          <span className={ui.count}>{waiting.length}</span>
        </h2>
        {waiting.length === 0 && <p className={ui.empty}>Nothing is waiting. Jobs the kids claim will show up here.</p>}
        <ul className={ui.list}>
          <AnimatePresence initial={false} mode="popLayout">
            {waiting.map(({ claim, job, kid }) => (
              <motion.li
                key={claim.id}
                className={[ui.row, styles.waitRow].join(" ")}
                layout={reduce ? false : "position"}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: 36, scale: 0.97 }}
                transition={{ duration: reduce ? 0.01 : 0.2, ease: "easeOut" }}
              >
                <span className={styles.jobPic}>
                  <JobIcon id={job.icon} size={44} />
                </span>
                <div className={ui.grow}>
                  <strong className={ui.name}>{job.name}</strong>
                  <span className={ui.sub}>
                    {kid.name} · <b data-money>{formatCents(job.valueCents)}</b>
                  </span>
                </div>
                <button
                  type="button"
                  className={ui.iconBtn}
                  aria-label={`Decline ${job.name} for ${kid.name}`}
                  onClick={() => {
                    sound.pop();
                    actions.declineClaim(claim.id);
                  }}
                >
                  <Icon name="x" size={22} />
                </button>
                <button
                  type="button"
                  className={[ui.iconBtn, ui.ok].join(" ")}
                  aria-label={`Approve ${job.name} for ${kid.name}, ${formatCents(job.valueCents)}`}
                  onClick={() => {
                    sound.coin();
                    actions.approveClaim(claim.id);
                  }}
                >
                  <Icon name="check" size={24} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <section className={ui.section} aria-labelledby="kids-h">
        <h2 className={ui.h2} id="kids-h">
          Kids
        </h2>
        {state.kids.length === 0 && <p className={ui.empty}>No kids yet. Add the first one to get started.</p>}
        <ul className={ui.list}>
          {state.kids.map((kid) => (
            <li key={kid.id} className={styles.kidRow}>
              <div className={styles.kidTop}>
                <Link href={`/parent/kids/${kid.id}`} className={styles.kidLink}>
                  <Mascot id={kid.mascot} color={kid.color} size={48} />
                  <span className={ui.grow}>
                    <span className={styles.kidName}>{kid.name}</span>
                    <span className={ui.sub}>{subLine(kid.id)}</span>
                    {kidInterest(kid) && (
                      <span className={[ui.sub, styles.interest].join(" ")}>
                        <Icon name="sprout" size={16} strokeWidth={3} />
                        {formatRate(kidInterest(kid)!.ratePercent)}% {PER_LABEL[kidInterest(kid)!.per]}
                      </span>
                    )}
                  </span>
                </Link>
                <BalanceNumber cents={balanceOf(state, kid.id)} className={ui.amt} />
              </div>
              <div className={styles.kidActs}>
                <button
                  type="button"
                  className={ui.smallBtn}
                  aria-label={`Gift for ${kid.name}`}
                  onClick={() => setSheet({ kidId: kid.id, mode: "gift", open: true })}
                >
                  <Icon name="plus" size={18} />
                  Gift
                </button>
                <button
                  type="button"
                  className={ui.smallBtn}
                  aria-label={`Spend for ${kid.name}`}
                  onClick={() => setSheet({ kidId: kid.id, mode: "spend", open: true })}
                >
                  <Icon name="minus" size={18} />
                  Spend
                </button>
              </div>
            </li>
          ))}
        </ul>
        <ButtonLink href="/parent/kids/new" variant="plain" className={styles.addKid}>
          <Icon name="plus" size={20} />
          Add a kid
        </ButtonLink>
      </section>

      {sheet && (
        <MoneySheet
          kidId={sheet.kidId}
          mode={sheet.mode}
          open={sheet.open}
          onClose={() => setSheet((s) => (s ? { ...s, open: false } : s))}
        />
      )}
    </div>
  );
}
