import { describe, expect, it } from "vitest";
import { badgesOf, balanceOf, goalProgress, historyOf, jobsForKid, periodStart, streakOf, waitingClaims } from "../selectors";
import type { Claim, Job, PocketState, Txn } from "../types";

const DAY = 86_400_000;
// Wednesday 12 March 2025, 15:00 local time.
const NOW = new Date(2025, 2, 12, 15, 0, 0).getTime();
const at = (daysAgo: number, hour = 9) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};

const job = (id: string, repeat: Job["repeat"], valueCents = 100): Job => ({
  id, name: id, icon: "bed", valueCents, kidIds: ["k1"], repeat,
});
const claim = (id: string, jobId: string, claimedAt: number, status: Claim["status"]): Claim => ({
  id, jobId, kidId: "k1", claimedAt, status,
});
const txn = (id: string, amountCents: number, when: number, type: Txn["type"] = "job"): Txn => ({
  id, kidId: "k1", type, amountCents, at: when,
});
function make(partial: Partial<PocketState> = {}): PocketState {
  return {
    kids: [{ id: "k1", name: "Kid", mascot: "blob", color: "pink" }],
    jobs: [], claims: [], txns: [], settings: { pin: "1234", muted: false },
    ...partial,
  };
}

describe("balanceOf", () => {
  it("sums signed txns for the kid only", () => {
    const s = make({
      txns: [txn("a", 500, at(1)), txn("b", -200, at(0), "spend"), { ...txn("c", 999, at(0)), kidId: "other" }],
    });
    expect(balanceOf(s, "k1")).toBe(300);
    expect(balanceOf(s, "nobody")).toBe(0);
  });
});

describe("periodStart", () => {
  it("daily is local midnight", () => {
    expect(periodStart("daily", NOW)).toBe(new Date(2025, 2, 12).getTime());
  });
  it("weekly is Monday midnight", () => {
    expect(periodStart("weekly", NOW)).toBe(new Date(2025, 2, 10).getTime());
    const sunday = new Date(2025, 2, 16, 20).getTime();
    expect(periodStart("weekly", sunday)).toBe(new Date(2025, 2, 10).getTime());
    const monday = new Date(2025, 2, 10, 0, 5).getTime();
    expect(periodStart("weekly", monday)).toBe(new Date(2025, 2, 10).getTime());
  });
  it("once is zero", () => {
    expect(periodStart("once", NOW)).toBe(0);
  });
});

describe("jobsForKid", () => {
  it("only returns non-archived jobs assigned to the kid", () => {
    const s = make({
      jobs: [job("a", "daily"), { ...job("b", "daily"), archived: true }, { ...job("c", "daily"), kidIds: ["k2"] }],
    });
    expect(jobsForKid(s, "k1", NOW).map((e) => e.job.id)).toEqual(["a"]);
  });

  it("daily: waiting and done today, todo again tomorrow", () => {
    const j = job("a", "daily");
    const waiting = make({ jobs: [j], claims: [claim("c1", "a", at(0, 8), "waiting")] });
    expect(jobsForKid(waiting, "k1", NOW)[0].status).toBe("waiting");
    const approved = make({ jobs: [j], claims: [claim("c1", "a", at(0, 8), "approved")] });
    expect(jobsForKid(approved, "k1", NOW)[0].status).toBe("done");
    expect(jobsForKid(approved, "k1", NOW + DAY)[0].status).toBe("todo");
    const yesterday = make({ jobs: [j], claims: [claim("c1", "a", at(1, 20), "approved")] });
    expect(jobsForKid(yesterday, "k1", NOW)[0].status).toBe("todo");
  });

  it("weekly: done earlier this week stays done until Monday", () => {
    const j = job("a", "weekly");
    const s = make({ jobs: [j], claims: [claim("c1", "a", at(2), "approved")] }); // Monday
    expect(jobsForKid(s, "k1", NOW)[0].status).toBe("done");
    const nextMonday = new Date(2025, 2, 17, 8).getTime();
    expect(jobsForKid(s, "k1", nextMonday)[0].status).toBe("todo");
    const lastWeek = make({ jobs: [j], claims: [claim("c1", "a", at(3), "approved")] }); // Sunday before
    expect(jobsForKid(lastWeek, "k1", NOW)[0].status).toBe("todo");
  });

  it("once: approved stays done forever", () => {
    const s = make({ jobs: [job("a", "once")], claims: [claim("c1", "a", at(40), "approved")] });
    expect(jobsForKid(s, "k1", NOW)[0].status).toBe("done");
    expect(jobsForKid(s, "k1", NOW + 400 * DAY)[0].status).toBe("done");
  });

  it("declined claims do not count, and the latest non-declined claim wins", () => {
    const j = job("a", "daily");
    const declined = make({ jobs: [j], claims: [claim("c1", "a", at(0, 8), "declined")] });
    expect(jobsForKid(declined, "k1", NOW)[0].status).toBe("todo");
    const retry = make({
      jobs: [j],
      claims: [claim("c1", "a", at(0, 8), "declined"), claim("c2", "a", at(0, 10), "waiting")],
    });
    const entry = jobsForKid(retry, "k1", NOW)[0];
    expect(entry.status).toBe("waiting");
    expect(entry.claim?.id).toBe("c2");
  });
});

describe("waitingClaims / historyOf", () => {
  it("lists waiting claims oldest first with job and kid", () => {
    const s = make({
      jobs: [job("a", "daily"), job("b", "daily")],
      claims: [claim("c2", "b", at(0, 11), "waiting"), claim("c1", "a", at(0, 9), "waiting"), claim("c3", "a", at(0, 8), "approved")],
    });
    const w = waitingClaims(s);
    expect(w.map((x) => x.claim.id)).toEqual(["c1", "c2"]);
    expect(w[0].job.id).toBe("a");
    expect(w[0].kid.id).toBe("k1");
  });
  it("history is newest first", () => {
    const s = make({ txns: [txn("a", 1, at(2)), txn("b", 1, at(0)), txn("c", 1, at(1))] });
    expect(historyOf(s, "k1").map((t) => t.id)).toEqual(["b", "c", "a"]);
  });
});

describe("streakOf", () => {
  it("counts consecutive days ending today", () => {
    const s = make({ txns: [txn("a", 50, at(0)), txn("b", 50, at(1)), txn("c", 50, at(2)), txn("d", 50, at(4))] });
    expect(streakOf(s, "k1", NOW)).toBe(3);
  });
  it("still counts when nothing has happened yet today", () => {
    const s = make({ txns: [txn("a", 50, at(1)), txn("b", 50, at(2))] });
    expect(streakOf(s, "k1", NOW)).toBe(2);
  });
  it("is zero once a full day is missed", () => {
    expect(streakOf(make({ txns: [txn("a", 50, at(2))] }), "k1", NOW)).toBe(0);
  });
  it("ignores gifts and spends, and counts several jobs in a day once", () => {
    const s = make({
      txns: [txn("a", 50, at(0), "gift"), txn("b", 50, at(1)), txn("c", 50, at(1, 17)), txn("d", -50, at(0), "spend")],
    });
    expect(streakOf(s, "k1", NOW)).toBe(1);
  });
});

describe("goalProgress and badges", () => {
  const goal = { name: "Kite", icon: "kite" as const, priceCents: 1000 };
  it("clamps the ratio", () => {
    const base = make({ txns: [txn("a", 400, at(0), "gift")] });
    base.kids[0].goal = goal;
    expect(goalProgress(base, "k1")?.ratio).toBeCloseTo(0.4);
    const rich = make({ txns: [txn("a", 5000, at(0), "gift")] });
    rich.kids[0].goal = goal;
    expect(goalProgress(rich, "k1")?.ratio).toBe(1);
    expect(goalProgress(make(), "k1")).toBeNull();
  });
  it("always returns the full badge list", () => {
    const b = badgesOf(make(), "k1", NOW);
    expect(b).toHaveLength(8);
    expect(b.every((x) => !x.earned)).toBe(true);
  });
  it("earns badges from history", () => {
    const s = make({
      txns: [txn("a", 50, at(0)), txn("b", 50, at(1)), txn("c", 50, at(2)), txn("d", 1000, at(5), "gift"), txn("e", -100, at(1), "spend")],
    });
    const earned = new Set(badgesOf(s, "k1", NOW).filter((x) => x.earned).map((x) => x.id));
    expect(earned).toEqual(new Set(["first-job", "streak-3", "saved-10", "first-spend"]));
  });
});
