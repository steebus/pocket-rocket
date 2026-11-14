import { GoalIcon } from "@/components/art/GoalIcon";
import { Icon } from "@/components/art/Icon";
import { JobIcon } from "@/components/art/JobIcon";
import { Mascot } from "@/components/art/Mascot";
import { Coin } from "@/components/ui/Coin";
import { formatCents, formatShort } from "@/lib/money";
import type { Goal, Job, Kid } from "@/lib/types";
import { ScissorsIcon } from "./PrintIcons";
import s from "./Sheet.module.css";

export function printDate(ts: number, withYear = true): string {
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
}

/** Full header on the first sheet; the small repeat on a continuation sheet. */
export function SheetHeader({ kid, now, small }: { kid: Kid; now: number; small?: boolean }) {
  return (
    <header className={small ? `${s.head} ${s.headSmall}` : s.head}>
      <Mascot id={kid.mascot} color={kid.color} size={small ? "11mm" : "22mm"} />
      <div className={s.headWho}>
        <h1 className={s.name} style={small ? undefined : { fontSize: kid.name.length > 16 ? "8.5mm" : kid.name.length > 10 ? "11mm" : undefined }}>
          {kid.name}
        </h1>
      </div>
      <div className={s.headRight}>
        <span className={s.brand}>
          <Coin size={20} style={{ width: small ? "5mm" : "6.5mm", height: small ? "5mm" : "6.5mm" }} />
          Pocket Rocket
        </span>
        <span className={s.printed}>Printed {printDate(now)}</span>
      </div>
    </header>
  );
}

/* ---------- jar ---------- */

export function PrintJar({ cents, goal, now, big }: { cents: number; goal?: Goal; now: number; big?: boolean }) {
  const text = formatCents(cents);
  const fit = text.length > 8 ? 0.7 : text.length > 7 ? 0.82 : 1;
  return (
    <div className={big ? `${s.jar} ${s.jarBig}` : s.jar} style={{ ["--fit" as string]: fit }}>
      <div className={s.lid} />
      <div className={s.glass}>
        <span className={s.shine} />
        {goal && (
          <div className={s.goal}>
            <span className={s.goalTag}>
              <GoalIcon id={goal.icon} size="9mm" />
              <span className={s.goalText}>
                <b>{goal.name}</b>
                <span>{formatCents(goal.priceCents)}</span>
              </span>
            </span>
          </div>
        )}
        <div className={s.bal}>
          <span className={s.balNum} data-money>
            {text}
          </span>
          <span className={s.balSub}>in the jar on {printDate(now, false)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- cut-out coins ---------- */

interface CoinKind {
  cents: number;
  cell: number; // mm, the whole cut-out square
  fill: string;
  count: number;
}

const COIN_KINDS: CoinKind[] = [
  { cents: 200, cell: 28, fill: "#ffc83d", count: 2 },
  { cents: 100, cell: 26, fill: "#ffc83d", count: 3 },
  { cents: 50, cell: 24, fill: "#ffe08a", count: 4 },
  { cents: 20, cell: 23, fill: "#fff1c2", count: 7 },
];

function CutCoin({ kind }: { kind: CoinKind }) {
  const label = formatShort(kind.cents);
  const big = kind.cents >= 100;
  return (
    <svg viewBox="0 0 50 50" width={`${kind.cell}mm`} height={`${kind.cell}mm`} className={s.coin} aria-label={label} role="img">
      <circle cx="25" cy="25" r="24.3" fill="none" stroke="#12312a" strokeWidth="0.9" strokeDasharray="2.4 2" />
      <circle cx="25" cy="25" r="21.6" fill={kind.fill} stroke="#12312a" strokeWidth="2.6" />
      <circle cx="25" cy="25" r="17.4" fill="none" stroke="#12312a" strokeWidth="1" strokeDasharray={big ? undefined : "1 2.2"} />
      <text
        x="25"
        y={big ? 32.5 : 31}
        textAnchor="middle"
        fontFamily="var(--font)"
        fontWeight={900}
        fontSize={big ? 21 : 16.5}
        fill="#12312a"
      >
        {label}
      </text>
    </svg>
  );
}

export function CoinSheet() {
  return (
    <section className={s.coins} aria-label="Coins to cut out">
      <p className={s.coinsNote}>
        <ScissorsIcon size="6mm" />
        <span>
          <b>Cut out the coins.</b> Stick one on the jar each time you add money, then add it in the app later.
        </span>
      </p>
      <div className={s.coinGrid}>
        {COIN_KINDS.flatMap((k) => Array.from({ length: k.count }, (_, i) => <CutCoin key={`${k.cents}-${i}`} kind={k} />))}
      </div>
    </section>
  );
}

/* ---------- jobs ---------- */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RANK = { daily: 0, weekly: 1, once: 2 } as const;

export function sortJobs(jobs: Job[]): Job[] {
  return jobs
    .map((j, i) => ({ j, i }))
    .sort((a, b) => RANK[a.j.repeat] - RANK[b.j.repeat] || a.i - b.i)
    .map((x) => x.j);
}

function Pair() {
  return (
    <span className={s.pair}>
      <span className={s.boxKid} />
      <span className={s.boxAdult} />
    </span>
  );
}

export function JobsTable({ kid, jobs }: { kid: Kid; jobs: Job[] }) {
  return (
    <table className={s.jobs}>
      <colgroup>
        <col className={s.cPic} />
        <col />
        <col className={s.cVal} />
        <col className={s.cTicks} />
      </colgroup>
      <thead>
        <tr className={s.legendRow}>
          <th colSpan={3} className={s.thTitle}>
            Jobs
          </th>
          <th className={s.thLegend}>
            <span className={s.legend}>
              <span className={s.legendItem}>
                <span className={`${s.boxKid} ${s.legendKid}`}>
                  <Mascot id={kid.mascot} color={kid.color} size="100%" />
                </span>
                I did it
              </span>
              <span className={s.legendItem}>
                <span className={`${s.boxAdult} ${s.legendAdult}`}>
                  <Icon name="check" size="100%" strokeWidth={6} />
                </span>
                Grown-up says OK
              </span>
            </span>
          </th>
        </tr>
        <tr className={s.dayRow}>
          <th colSpan={3} />
          <th>
            <span className={s.days}>
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id} className={s.jobRow}>
            <td className={s.tdPic}>
              <JobIcon id={job.icon} size="10mm" />
            </td>
            <td className={s.tdName}>{job.name}</td>
            <td className={s.tdVal} data-money>
              {formatShort(job.valueCents)}
            </td>
            <td className={s.tdTicks}>
              {job.repeat === "daily" ? (
                <span className={s.days}>
                  {DAYS.map((d) => (
                    <Pair key={d} />
                  ))}
                </span>
              ) : (
                <span className={s.once}>
                  <Pair />
                  <span className={s.onceText}>{job.repeat === "weekly" ? "Once this week" : "Just once"}</span>
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function NoJobs({ name }: { name: string }) {
  return <p className={s.noJobs}>No jobs are set up for {name} yet. Add some in the app and print again.</p>;
}
