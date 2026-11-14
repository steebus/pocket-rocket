import { daysBefore } from "./interest";
import type { Claim, Job, Kid, PocketState, Txn } from "./types";

const HOUR = 3_600_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Demo family: Mia $12.50 (4 day streak), Leo $31.20 (interest on), Zadie $4.80, two claims waiting. */
export function makeFixtures(now: number): PocketState {
  /** A moment `daysAgo` local days back at roughly `hour` o'clock (never in the future). */
  const at = (daysAgo: number, hour: number): number => {
    const d = new Date(startOfDay(now));
    d.setDate(d.getDate() - daysAgo);
    return Math.min(d.getTime() + hour * HOUR, now);
  };

  const kids: Kid[] = [
    { id: "kid-mia", name: "Mia", mascot: "blob", color: "pink", goal: { name: "Scooter", icon: "scooter", priceCents: 4000 } },
    { id: "kid-leo", name: "Leo", mascot: "bean", color: "sky", goal: { name: "Kite", icon: "kite", priceCents: 1800 },
      // Interest is on, last paid three days ago, so the first open of Leo's jar shows the celebration.
      interest: { enabled: true, ratePercent: 1, per: "week", paidThrough: daysBefore(now, 3), carry: 0 } },
    { id: "kid-zadie", name: "Zadie", mascot: "cat", color: "lime" },
  ];

  const jobs: Job[] = [
    { id: "job-bed", name: "Make bed", icon: "bed", valueCents: 50, kidIds: ["kid-mia", "kid-leo", "kid-zadie"], repeat: "daily" },
    { id: "job-teeth", name: "Brush teeth", icon: "brush", valueCents: 20, kidIds: ["kid-mia", "kid-leo", "kid-zadie"], repeat: "daily" },
    { id: "job-biscuit", name: "Feed Biscuit", icon: "bowl", valueCents: 100, kidIds: ["kid-mia", "kid-leo"], repeat: "daily" },
    { id: "job-toys", name: "Tidy toys", icon: "toys", valueCents: 50, kidIds: ["kid-mia", "kid-zadie"], repeat: "daily" },
    { id: "job-dishes", name: "Help with dishes", icon: "dishes", valueCents: 100, kidIds: ["kid-mia", "kid-leo"], repeat: "daily" },
    { id: "job-plants", name: "Water plants", icon: "plant", valueCents: 50, kidIds: ["kid-leo", "kid-zadie"], repeat: "weekly" },
    { id: "job-rubbish", name: "Take out rubbish", icon: "rubbish", valueCents: 150, kidIds: ["kid-leo"], repeat: "weekly" },
    { id: "job-laundry", name: "Fold laundry", icon: "laundry", valueCents: 200, kidIds: ["kid-mia", "kid-leo"], repeat: "weekly" },
    { id: "job-shoes", name: "Shoes away", icon: "shoes", valueCents: 20, kidIds: ["kid-zadie"], repeat: "daily" },
    { id: "job-car", name: "Wash the car", icon: "car", valueCents: 200, kidIds: ["kid-leo", "kid-mia"], repeat: "once" },
  ];

  const claims: Claim[] = [];
  const txns: Txn[] = [];
  let n = 0;

  const done = (kidId: string, jobId: string, daysAgo: number, hour: number) => {
    const job = jobs.find((j) => j.id === jobId)!;
    const t = at(daysAgo, hour);
    n++;
    claims.push({ id: `claim-${n}`, jobId, kidId, claimedAt: Math.max(0, t - HOUR), status: "approved", resolvedAt: t });
    txns.push({ id: `txn-${n}`, kidId, type: "job", amountCents: job.valueCents, note: job.name, jobId, at: t });
  };
  const gift = (kidId: string, cents: number, note: string, daysAgo: number, hour: number) => {
    n++;
    txns.push({ id: `txn-${n}`, kidId, type: "gift", amountCents: cents, note, at: at(daysAgo, hour) });
  };
  const spend = (kidId: string, cents: number, note: string, daysAgo: number, hour: number) => {
    n++;
    txns.push({ id: `txn-${n}`, kidId, type: "spend", amountCents: -cents, note, at: at(daysAgo, hour) });
  };

  // Mia: jobs on each of the last four days (streak 4), a few earlier ones.
  for (const d of [0, 1, 2, 3]) {
    done("kid-mia", "job-bed", d, 8);
    done("kid-mia", "job-teeth", d, 8.5);
  }
  done("kid-mia", "job-biscuit", 1, 17);
  done("kid-mia", "job-biscuit", 2, 17);
  done("kid-mia", "job-biscuit", 3, 17);
  done("kid-mia", "job-toys", 1, 16);
  done("kid-mia", "job-toys", 3, 16);
  done("kid-mia", "job-dishes", 2, 18);
  done("kid-mia", "job-laundry", 5, 10);
  done("kid-mia", "job-bed", 6, 8);
  done("kid-mia", "job-toys", 8, 16);
  done("kid-mia", "job-biscuit", 9, 17);
  spend("kid-mia", 300, "Stickers", 7, 15);

  // Leo: steady worker, a birthday gift and a purchase.
  for (const d of [1, 2, 4, 5, 8, 9, 10]) done("kid-leo", "job-bed", d, 7.5);
  for (const d of [1, 2, 4, 5, 9]) done("kid-leo", "job-biscuit", d, 17);
  done("kid-leo", "job-rubbish", 3, 18);
  done("kid-leo", "job-rubbish", 10, 18);
  done("kid-leo", "job-laundry", 4, 10);
  done("kid-leo", "job-car", 5, 11);
  done("kid-leo", "job-plants", 2, 12);
  gift("kid-leo", 2000, "Birthday money from Nan", 11, 12);
  spend("kid-leo", 500, "Football cards", 6, 15);

  // Zadie: just getting started.
  for (const d of [1, 2, 3, 7]) done("kid-zadie", "job-shoes", d, 18);
  done("kid-zadie", "job-toys", 2, 16);
  done("kid-zadie", "job-bed", 3, 8);
  done("kid-zadie", "job-plants", 4, 12);
  spend("kid-zadie", 100, "Lolly", 5, 15);

  // Top each kid up with an earlier "pocket money" gift so balances land on the demo amounts.
  const targets: Record<string, number> = { "kid-mia": 1250, "kid-leo": 3120, "kid-zadie": 480 };
  for (const [kidId, target] of Object.entries(targets)) {
    const have = txns.filter((t) => t.kidId === kidId).reduce((s, t) => s + t.amountCents, 0);
    const diff = target - have;
    if (diff > 0) gift(kidId, diff, "Pocket money", 13, 9);
    else if (diff < 0) spend(kidId, -diff, "Treat", 13, 9);
  }

  // Two jobs waiting for a parent.
  claims.push({ id: "claim-w1", jobId: "job-biscuit", kidId: "kid-mia", claimedAt: at(0, 9), status: "waiting" });
  claims.push({ id: "claim-w2", jobId: "job-bed", kidId: "kid-leo", claimedAt: at(0, 10), status: "waiting" });

  return {
    kids,
    jobs,
    claims,
    txns,
    settings: { pin: "1234", muted: false },
  };
}
