"use client";

import { Icon } from "@/components/art/Icon";
import { JobIcon } from "@/components/art/JobIcon";
import { BadgeMedal } from "@/components/kid/BadgeMedal";
import { useKid } from "@/components/kid/KidContext";
import { formatShort } from "@/lib/money";
import { badgesOf, historyOf, streakOf } from "@/lib/selectors";
import { speak } from "@/lib/speak";
import { usePocket } from "@/lib/store";
import type { PocketState, Txn } from "@/lib/types";
import styles from "./page.module.css";

const TILTS = [-4, 3, -2, 4, -3, 2, -4, 3];
const DAY = 86_400_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(ts: number, now: number): string {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}

function describe(t: Txn, state: PocketState): string {
  if (t.note) return t.note;
  if (t.type === "job") return state.jobs.find((j) => j.id === t.jobId)?.name ?? "A job";
  return t.type === "gift" ? "A gift" : "Spent";
}

function TxnPicture({ t, state }: { t: Txn; state: PocketState }) {
  if (t.type === "job") {
    const icon = state.jobs.find((j) => j.id === t.jobId)?.icon;
    return icon ? <JobIcon id={icon} size={40} /> : <Icon name="coin" size={34} />;
  }
  return <Icon name={t.type === "gift" ? "gift" : "cart"} size={34} />;
}

export default function KidStuff() {
  const kid = useKid();
  const { state } = usePocket();
  const now = Date.now();

  const streak = streakOf(state, kid.id, now);
  const badges = badgesOf(state, kid.id, now);
  const history = historyOf(state, kid.id).slice(0, 60);

  const groups: { label: string; items: Txn[] }[] = [];
  for (const t of history) {
    const label = dayLabel(t.at, now);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(t);
    else groups.push({ label, items: [t] });
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.sr}>{kid.name}&apos;s stuff</h1>

      <section className={styles.streak} data-on={streak > 0 ? "yes" : "no"} aria-label="Your streak">
        <span className={styles.flame}>
          <Icon name="flame" size="100%" strokeWidth={3} />
        </span>
        {streak > 0 ? (
          <p className={styles.streakText}>
            <span className={styles.streakNum} data-money>
              {streak}
            </span>
            <span className={styles.streakUnit}>{streak === 1 ? "day in a row" : "days in a row"}</span>
          </p>
        ) : (
          <p className={styles.streakUnit}>Do a job today to light your streak!</p>
        )}
      </section>

      <section aria-labelledby="badges-title">
        <h2 id="badges-title" className={styles.heading}>
          Stickers
        </h2>
        <ul className={styles.badges}>
          {badges.map((b, i) => (
            <li key={b.id}>
              <button
                type="button"
                className={styles.badge}
                onClick={() => speak(b.earned ? `${b.name}. ${b.description}` : `${b.name}. ${b.description}. Keep going!`)}
                aria-label={`${b.name}. ${b.earned ? "You got it." : "Not yet."} ${b.description}. Tap to hear it.`}
              >
                <BadgeMedal id={b.id} earned={b.earned} tilt={TILTS[i % TILTS.length]} />
                <span className={styles.badgeName}>{b.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="history-title" className={styles.history}>
        <h2 id="history-title" className={styles.heading}>
          What happened
        </h2>
        {groups.length === 0 ? (
          <p className={styles.empty}>
            <Icon name="coin" size={44} />
            Nothing yet. Do a job and your coins will show up here!
          </p>
        ) : (
          groups.map((g) => (
            <div key={g.label} className={styles.day}>
              <h3 className={styles.dayName}>{g.label}</h3>
              <ul className={styles.list}>
                {g.items.map((t) => {
                  const earned = t.amountCents > 0;
                  return (
                    <li key={t.id} className={styles.row}>
                      <span className={styles.rowPic}>
                        <TxnPicture t={t} state={state} />
                      </span>
                      <span className={styles.rowName}>{describe(t, state)}</span>
                      <span className={styles.amount} data-earned={earned ? "yes" : "no"} data-money>
                        {earned ? "+" : ""}
                        {formatShort(t.amountCents)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
