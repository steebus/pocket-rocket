import type { Badge, Claim, Goal, Job, JobStatus, Kid, PocketState, Repeat, Txn } from "./types";

/** Pure read helpers. Each is a future Convex query. */

export function balanceOf(state: PocketState, kidId: string): number {
  return state.txns.reduce((sum, t) => (t.kidId === kidId ? sum + t.amountCents : sum), 0);
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function periodStart(repeat: Repeat, now: number): number {
  if (repeat === "once") return 0;
  const d = new Date(startOfDay(now));
  if (repeat === "daily") return d.getTime();
  const back = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - back);
  return d.getTime();
}

export function jobsForKid(
  state: PocketState,
  kidId: string,
  now: number,
): { job: Job; status: JobStatus; claim?: Claim }[] {
  return state.jobs
    .filter((j) => !j.archived && j.kidIds.includes(kidId))
    .map((job) => {
      const from = periodStart(job.repeat, now);
      const latest = state.claims
        .filter((c) => c.jobId === job.id && c.kidId === kidId && c.status !== "declined" && c.claimedAt >= from)
        .sort((a, b) => b.claimedAt - a.claimedAt)[0];
      const status: JobStatus = latest ? (latest.status === "approved" ? "done" : "waiting") : "todo";
      return latest ? { job, status, claim: latest } : { job, status };
    });
}

export function waitingClaims(state: PocketState): { claim: Claim; job: Job; kid: Kid }[] {
  const out: { claim: Claim; job: Job; kid: Kid }[] = [];
  for (const claim of state.claims) {
    if (claim.status !== "waiting") continue;
    const job = state.jobs.find((j) => j.id === claim.jobId);
    const kid = state.kids.find((k) => k.id === claim.kidId);
    if (job && kid) out.push({ claim, job, kid });
  }
  return out.sort((a, b) => a.claim.claimedAt - b.claim.claimedAt);
}

export function historyOf(state: PocketState, kidId: string): Txn[] {
  return state.txns.filter((t) => t.kidId === kidId).sort((a, b) => b.at - a.at);
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function jobDays(state: PocketState, kidId: string): Set<string> {
  return new Set(
    state.txns.filter((t) => t.kidId === kidId && t.type === "job" && t.amountCents > 0).map((t) => dayKey(t.at)),
  );
}

/** Consecutive local days with an approved job, ending today (or yesterday if nothing yet today). */
export function streakOf(state: PocketState, kidId: string, now: number): number {
  const days = jobDays(state, kidId);
  const cursor = new Date(startOfDay(now));
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

export function goalProgress(
  state: PocketState,
  kidId: string,
): { goal: Goal; savedCents: number; ratio: number } | null {
  const kid = state.kids.find((k) => k.id === kidId);
  if (!kid?.goal) return null;
  const savedCents = Math.max(0, balanceOf(state, kidId));
  const ratio = kid.goal.priceCents > 0 ? Math.min(1, Math.max(0, savedCents / kid.goal.priceCents)) : 0;
  return { goal: kid.goal, savedCents, ratio };
}

/** Longest run of consecutive job days ever, so a streak badge stays earned after the streak breaks. */
function bestStreak(state: PocketState, kidId: string): number {
  const stamps = [
    ...new Set(
      state.txns
        .filter((t) => t.kidId === kidId && t.type === "job" && t.amountCents > 0)
        .map((t) => startOfDay(t.at)),
    ),
  ].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const ts of stamps) {
    if (prev !== null) {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      run = dayKey(next.getTime()) === dayKey(ts) ? run + 1 : 1;
    } else run = 1;
    best = Math.max(best, run);
    prev = ts;
  }
  return best;
}

export function badgesOf(state: PocketState, kidId: string, now: number): Badge[] {
  const jobCount = state.txns.filter((t) => t.kidId === kidId && t.type === "job" && t.amountCents > 0).length;
  const best = Math.max(bestStreak(state, kidId), streakOf(state, kidId, now));
  const balance = balanceOf(state, kidId);
  const kid = state.kids.find((k) => k.id === kidId);
  const spent = state.txns.some((t) => t.kidId === kidId && t.type === "spend");
  const reachedGoal = !!kid?.goal && balance >= kid.goal.priceCents;

  return [
    { id: "first-job", name: "First job", description: "Finish your first job", earned: jobCount >= 1 },
    { id: "ten-jobs", name: "10 jobs", description: "Finish 10 jobs", earned: jobCount >= 10 },
    { id: "streak-3", name: "3 day streak", description: "Do jobs 3 days in a row", earned: best >= 3 },
    { id: "streak-7", name: "7 day streak", description: "Do jobs 7 days in a row", earned: best >= 7 },
    { id: "saved-10", name: "Saved $10", description: "Have $10 in your jar", earned: balance >= 1000 },
    { id: "saved-25", name: "Saved $25", description: "Have $25 in your jar", earned: balance >= 2500 },
    { id: "goal", name: "Goal reached", description: "Save enough for your goal", earned: reachedGoal },
    { id: "first-spend", name: "First spend", description: "Spend some of your money", earned: spent },
  ];
}
