import { describe, expect, it } from "vitest";
import { makeFixtures } from "../fixtures";
import { balanceOf, jobsForKid, streakOf, waitingClaims } from "../selectors";
import { reduce } from "../store";

const NOW = new Date(2025, 2, 12, 15, 0, 0).getTime();

describe("fixtures", () => {
  const s = makeFixtures(NOW);
  it("hits the demo balances", () => {
    expect(balanceOf(s, "kid-mia")).toBe(1250);
    expect(balanceOf(s, "kid-leo")).toBe(3120);
    expect(balanceOf(s, "kid-zadie")).toBe(480);
  });
  it("has the three kids and PIN", () => {
    expect(s.kids.map((k) => k.name)).toEqual(["Mia", "Leo", "Zadie"]);
    expect(s.kids[2].goal).toBeUndefined();
    expect(s.settings).toEqual({ pin: "1234", muted: false });
    expect(s.jobs.length).toBeGreaterThanOrEqual(8);
  });
  it("gives Mia a 4 day streak", () => {
    expect(streakOf(s, "kid-mia", NOW)).toBe(4);
  });
  it("has two waiting claims", () => {
    const w = waitingClaims(s);
    expect(w).toHaveLength(2);
    expect(w[0]).toMatchObject({ kid: { name: "Mia" }, job: { name: "Feed Biscuit", valueCents: 100 } });
    expect(w[1]).toMatchObject({ kid: { name: "Leo" }, job: { name: "Make bed", valueCents: 50 } });
  });
  it("holds up when generated just after midnight", () => {
    const early = new Date(2025, 2, 12, 0, 10).getTime();
    const e = makeFixtures(early);
    expect(balanceOf(e, "kid-mia")).toBe(1250);
    expect(waitingClaims(e)).toHaveLength(2);
  });
});

describe("reduce", () => {
  it("claim then approve pays the job value", () => {
    let s = makeFixtures(NOW);
    expect(jobsForKid(s, "kid-leo", NOW).find((e) => e.job.id === "job-rubbish")?.status).toBe("todo");
    s = reduce(s, { type: "claimJob", kidId: "kid-leo", jobId: "job-rubbish" }, NOW);
    const waiting = waitingClaims(s).find((w) => w.job.id === "job-rubbish")!;
    expect(waiting).toBeDefined();
    const before = balanceOf(s, "kid-leo");
    s = reduce(s, { type: "approveClaim", claimId: waiting.claim.id }, NOW);
    expect(balanceOf(s, "kid-leo")).toBe(before + 150);
    expect(s.txns.at(-1)).toMatchObject({ type: "job", jobId: "job-rubbish", amountCents: 150 });
  });

  it("ignores a second claim while one is waiting", () => {
    let s = makeFixtures(NOW);
    const n = s.claims.length;
    s = reduce(s, { type: "claimJob", kidId: "kid-mia", jobId: "job-biscuit" }, NOW);
    expect(s.claims).toHaveLength(n);
  });

  it("decline lets the kid claim again and pays nothing", () => {
    let s = makeFixtures(NOW);
    const { claim } = waitingClaims(s)[0];
    const before = balanceOf(s, claim.kidId);
    s = reduce(s, { type: "declineClaim", claimId: claim.id }, NOW);
    expect(balanceOf(s, claim.kidId)).toBe(before);
    expect(jobsForKid(s, claim.kidId, NOW).find((e) => e.job.id === claim.jobId)?.status).toBe("todo");
    s = reduce(s, { type: "claimJob", kidId: claim.kidId, jobId: claim.jobId }, NOW);
    expect(jobsForKid(s, claim.kidId, NOW).find((e) => e.job.id === claim.jobId)?.status).toBe("waiting");
  });

  it("approving twice only pays once", () => {
    let s = makeFixtures(NOW);
    const { claim } = waitingClaims(s)[0];
    s = reduce(s, { type: "approveClaim", claimId: claim.id }, NOW);
    const after = balanceOf(s, claim.kidId);
    s = reduce(s, { type: "approveClaim", claimId: claim.id }, NOW);
    expect(balanceOf(s, claim.kidId)).toBe(after);
  });

  it("gifts add money", () => {
    let s = makeFixtures(NOW);
    s = reduce(s, { type: "addGift", kidId: "kid-zadie", amountCents: 500, note: "Nan" }, NOW);
    expect(balanceOf(s, "kid-zadie")).toBe(980);
    expect(s.txns.at(-1)).toMatchObject({ type: "gift", note: "Nan" });
  });

  it("spend deducts, and clamps to the balance (never below zero)", () => {
    let s = makeFixtures(NOW);
    s = reduce(s, { type: "spend", kidId: "kid-zadie", amountCents: 100 }, NOW);
    expect(balanceOf(s, "kid-zadie")).toBe(380);
    s = reduce(s, { type: "spend", kidId: "kid-zadie", amountCents: 99_999, note: "Big toy" }, NOW);
    expect(balanceOf(s, "kid-zadie")).toBe(0);
    expect(s.txns.at(-1)).toMatchObject({ type: "spend", amountCents: -380 });
    const again = reduce(s, { type: "spend", kidId: "kid-zadie", amountCents: 50 }, NOW);
    expect(again).toBe(s);
  });

  it("upserts and archives jobs, kids and goals", () => {
    let s = makeFixtures(NOW);
    s = reduce(s, { type: "upsertJob", job: { name: "Read", icon: "book", valueCents: 30, kidIds: ["kid-mia"], repeat: "daily" } }, NOW);
    const added = s.jobs.at(-1)!;
    expect(added.id).toBeTruthy();
    s = reduce(s, { type: "upsertJob", job: { ...added, valueCents: 40 } }, NOW);
    expect(s.jobs.filter((j) => j.id === added.id)).toHaveLength(1);
    expect(s.jobs.find((j) => j.id === added.id)?.valueCents).toBe(40);
    s = reduce(s, { type: "archiveJob", jobId: added.id }, NOW);
    expect(jobsForKid(s, "kid-mia", NOW).some((e) => e.job.id === added.id)).toBe(false);

    s = reduce(s, { type: "setGoal", kidId: "kid-zadie", goal: { name: "Ball", icon: "ball", priceCents: 900 } }, NOW);
    expect(s.kids.find((k) => k.id === "kid-zadie")?.goal?.name).toBe("Ball");
    s = reduce(s, { type: "setGoal", kidId: "kid-zadie", goal: undefined }, NOW);
    expect(s.kids.find((k) => k.id === "kid-zadie")?.goal).toBeUndefined();

    s = reduce(s, { type: "upsertKid", kid: { name: "Sam", mascot: "dino", color: "orange" } }, NOW);
    expect(s.kids).toHaveLength(4);
  });

  it("removeKid clears their data and job assignments", () => {
    let s = makeFixtures(NOW);
    s = reduce(s, { type: "removeKid", kidId: "kid-leo" }, NOW);
    expect(s.kids.some((k) => k.id === "kid-leo")).toBe(false);
    expect(s.txns.some((t) => t.kidId === "kid-leo")).toBe(false);
    expect(s.claims.some((c) => c.kidId === "kid-leo")).toBe(false);
    expect(s.jobs.some((j) => j.kidIds.includes("kid-leo"))).toBe(false);
  });

  it("settings and reset", () => {
    let s = makeFixtures(NOW);
    s = reduce(s, { type: "setPin", pin: "9876" }, NOW);
    s = reduce(s, { type: "setMuted", muted: true }, NOW);
    expect(s.settings).toEqual({ pin: "9876", muted: true });
    s = reduce(s, { type: "resetDemo" }, NOW);
    expect(s.settings).toEqual({ pin: "1234", muted: false });
    expect(balanceOf(s, "kid-mia")).toBe(1250);
  });
});
