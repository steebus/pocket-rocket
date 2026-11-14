import { describe, expect, it } from "vitest";
import { makeFixtures } from "../fixtures";
import { daysBefore, formatRate, interestDue, parseRate, rateError } from "../interest";
import { badgesOf, balanceOf, historyOf } from "../selectors";
import { reduce } from "../store";
import type { Interest, PocketState, Txn } from "../types";

const NOW = new Date(2025, 2, 12, 15, 0, 0).getTime();
const START = daysBefore(NOW, 0);

function make(balance: number, interest?: Partial<Interest>, extra: Txn[] = []): PocketState {
  return {
    kids: [
      {
        id: "k",
        name: "Kid",
        mascot: "blob",
        color: "pink",
        interest: interest && { enabled: true, ratePercent: 1, per: "week", paidThrough: daysBefore(NOW, 1), carry: 0, ...interest },
      },
    ],
    jobs: [],
    claims: [],
    txns: [{ id: "t0", kidId: "k", type: "gift", amountCents: balance, at: NOW - 10 * 86_400_000 }, ...extra],
    settings: { pin: "1234", muted: false },
  };
}

describe("interestDue", () => {
  it("is nothing when off, missing, paid today or the jar is empty", () => {
    expect(interestDue(make(10_000), "k", NOW)).toEqual({ days: 0, cents: 0, carry: 0 });
    const off = make(10_000, { enabled: false });
    expect(interestDue(off, "k", NOW).cents).toBe(0);
    expect(interestDue(make(10_000, { paidThrough: START }), "k", NOW)).toEqual({ days: 0, cents: 0, carry: 0 });
    expect(interestDue(make(0), "k", NOW).cents).toBe(0);
    expect(interestDue(make(0, { paidThrough: daysBefore(NOW, 5) }), "k", NOW).cents).toBe(0);
    expect(interestDue(make(1000), "nobody", NOW).days).toBe(0);
  });

  it("uses a daily rate of rate/7, rate/30 or rate/365", () => {
    // $1000, 7% for one day: week = 1%/day, month = 7/30 %/day, year = 7/365 %/day
    const one = (per: Interest["per"]) => interestDue(make(100_000, { ratePercent: 7, per }), "k", NOW);
    expect(one("week")).toMatchObject({ days: 1, cents: 1000 });
    expect(one("month").cents).toBe(Math.floor(100_000 * (0.07 / 30)));
    expect(one("month").cents).toBe(233);
    expect(one("year").cents).toBe(Math.floor(100_000 * (0.07 / 365)));
    expect(one("year").cents).toBe(19);
    expect(one("year").carry).toBeCloseTo(100_000 * (0.07 / 365) - 19, 6);
  });

  it("compounds across several days", () => {
    const due = interestDue(make(10_000, { ratePercent: 7, per: "week", paidThrough: daysBefore(NOW, 3) }), "k", NOW);
    expect(due.days).toBe(3);
    const owed = 10_000 * (Math.pow(1.01, 3) - 1); // 303.01
    expect(due.cents).toBe(303);
    expect(due.carry).toBeCloseTo(owed - 303, 6);
    // simple interest would have been exactly 300
    expect(due.cents).toBeGreaterThan(300);
  });

  it("caps the days at 366", () => {
    const due = interestDue(make(1000, { ratePercent: 1, per: "year", paidThrough: daysBefore(NOW, 900) }), "k", NOW);
    expect(due.days).toBe(366);
  });

  it("adds the previous carry", () => {
    const due = interestDue(make(1000, { ratePercent: 7, per: "week", carry: 0.9 }), "k", NOW);
    // 1000 * 0.01 = 10 + 0.9
    expect(due.cents).toBe(10);
    expect(due.carry).toBeCloseTo(0.9, 6);
    expect(interestDue(make(10, { ratePercent: 7, per: "week", carry: 0.95 }), "k", NOW).cents).toBe(1);
  });
});

describe("payInterest", () => {
  it("adds one interest txn, moves the day and stores the carry", () => {
    const s0 = make(3120, { ratePercent: 1, per: "week", paidThrough: daysBefore(NOW, 3) });
    const due = interestDue(s0, "k", NOW);
    const s1 = reduce(s0, { type: "payInterest", kidId: "k" }, NOW);
    expect(s1.txns.at(-1)).toMatchObject({ type: "interest", amountCents: due.cents, note: "Interest for 3 days", kidId: "k" });
    expect(balanceOf(s1, "k")).toBe(3120 + due.cents);
    expect(s1.kids[0].interest).toMatchObject({ paidThrough: START, enabled: true });
    expect(s1.kids[0].interest?.carry).toBeCloseTo(due.carry, 9);
  });

  it("changes nothing the second time in a day", () => {
    const s1 = reduce(make(3120, { paidThrough: daysBefore(NOW, 2) }), { type: "payInterest", kidId: "k" }, NOW);
    const later = NOW + 3_600_000; // 16:00, same day
    expect(reduce(s1, { type: "payInterest", kidId: "k" }, later)).toBe(s1);
  });

  it("says '1 day' for a single day", () => {
    const s1 = reduce(make(5000, {}), { type: "payInterest", kidId: "k" }, NOW);
    expect(s1.txns.at(-1)?.note).toBe("Interest for 1 day");
  });

  it("lets a tiny balance earn over time through the carry", () => {
    // 50c at 1% a week is ~0.07c a day: no cent for a long while, then one.
    let s = make(50, { ratePercent: 1, per: "week", paidThrough: daysBefore(NOW, 1) });
    let first = -1;
    for (let d = 0; d < 30; d++) {
      const now = new Date(2025, 2, 12 + d, 15).getTime();
      const before = s.txns.length;
      s = reduce(s, { type: "payInterest", kidId: "k" }, now);
      if (s.txns.length > before && first < 0) first = d;
      expect(s.kids[0].interest!.carry).toBeGreaterThanOrEqual(0);
      expect(s.kids[0].interest!.carry).toBeLessThan(1);
    }
    expect(first).toBeGreaterThan(5);
    expect(first).toBeLessThan(30);
    expect(balanceOf(s, "k")).toBeGreaterThan(50);
    // a day that pays under 1c still moves the day and writes no txn
    const none = reduce(make(50, { paidThrough: daysBefore(NOW, 1) }), { type: "payInterest", kidId: "k" }, NOW);
    expect(none.txns).toHaveLength(1);
    expect(none.kids[0].interest).toMatchObject({ paidThrough: START });
    expect(none.kids[0].interest!.carry).toBeGreaterThan(0);
  });

  it("does nothing when interest is off", () => {
    const s = make(1000);
    expect(reduce(s, { type: "payInterest", kidId: "k" }, NOW)).toBe(s);
  });

  it("interest shows in history and badges, and earns Money grew", () => {
    const s0 = make(3120, { paidThrough: daysBefore(NOW, 3) });
    expect(badgesOf(s0, "k", NOW).find((b) => b.id === "money-grew")?.earned).toBe(false);
    const s1 = reduce(s0, { type: "payInterest", kidId: "k" }, NOW);
    expect(historyOf(s1, "k")[0].type).toBe("interest");
    expect(badgesOf(s1, "k", NOW).find((b) => b.id === "money-grew")?.earned).toBe(true);
    expect(badgesOf(s1, "k", NOW).find((b) => b.id === "saved-25")?.earned).toBe(true);
  });
});

describe("turning interest on and off", () => {
  const kid = { name: "Kid", mascot: "blob" as const, color: "pink" as const };
  const on = (rate: number, per: Interest["per"] = "week"): Interest => ({ enabled: true, ratePercent: rate, per, paidThrough: 0, carry: 0 });

  it("starts from today when switched on, so nothing is due until tomorrow", () => {
    let s = make(5000);
    s = reduce(s, { type: "upsertKid", kid: { ...kid, id: "k", interest: on(2) } }, NOW);
    expect(s.kids[0].interest).toMatchObject({ enabled: true, ratePercent: 2, per: "week", paidThrough: START, carry: 0 });
    expect(interestDue(s, "k", NOW).days).toBe(0);
    expect(interestDue(s, "k", NOW + 86_400_000).days).toBe(1);
  });

  it("keeps the schedule when only the rate changes while on", () => {
    let s = make(5000, { paidThrough: daysBefore(NOW, 2), carry: 0.4 });
    s = reduce(s, { type: "upsertKid", kid: { ...kid, id: "k", interest: on(3, "month") } }, NOW);
    expect(s.kids[0].interest).toMatchObject({ ratePercent: 3, per: "month", paidThrough: daysBefore(NOW, 2), carry: 0.4 });
  });

  it("off keeps past interest and stops accrual; on again restarts from today", () => {
    let s = reduce(make(3120, { paidThrough: daysBefore(NOW, 3) }), { type: "payInterest", kidId: "k" }, NOW);
    const bal = balanceOf(s, "k");
    s = reduce(s, { type: "upsertKid", kid: { ...kid, id: "k", interest: { ...s.kids[0].interest!, enabled: false } } }, NOW);
    expect(s.txns.some((t) => t.type === "interest")).toBe(true);
    expect(s.kids[0].interest?.enabled).toBe(false);
    const later = NOW + 5 * 86_400_000;
    expect(interestDue(s, "k", later).cents).toBe(0);
    expect(reduce(s, { type: "payInterest", kidId: "k" }, later)).toBe(s);
    expect(balanceOf(s, "k")).toBe(bal);
    s = reduce(s, { type: "upsertKid", kid: { ...kid, id: "k", interest: on(1) } }, later);
    expect(s.kids[0].interest).toMatchObject({ enabled: true, paidThrough: daysBefore(later, 0), carry: 0 });
  });

  it("leaves interest alone when a save does not mention it, and refuses a bad rate", () => {
    let s = make(5000, { paidThrough: daysBefore(NOW, 2) });
    s = reduce(s, { type: "upsertKid", kid: { ...kid, id: "k", name: "Renamed" } }, NOW);
    expect(s.kids[0].interest?.enabled).toBe(true);
    s = reduce(s, { type: "upsertKid", kid: { ...kid, id: "k", interest: on(500) } }, NOW);
    expect(s.kids[0].interest?.enabled).toBe(false);
  });

  it("old saved kids with no interest field are simply off", () => {
    const s = makeFixtures(NOW);
    const zadie = s.kids.find((k) => k.id === "kid-zadie")!;
    expect(zadie.interest).toBeUndefined();
    expect(interestDue(s, "kid-zadie", NOW).cents).toBe(0);
  });
});

describe("rate rules", () => {
  it("validates the rate", () => {
    expect(rateError(1, "week")).toBeNull();
    expect(rateError(100, "year")).toBeNull();
    expect(rateError(0, "week")).toMatch(/more than 0/);
    expect(rateError(-1, "week")).toMatch(/more than 0/);
    expect(rateError(100.5, "month")).toMatch(/100% a month/);
    expect(rateError(null, "week")).toMatch(/Enter a rate/);
  });
  it("parses and formats", () => {
    expect(parseRate("2.5")).toBe(2.5);
    expect(parseRate(" .5% ")).toBe(0.5);
    expect(parseRate("abc")).toBeNull();
    expect(parseRate("")).toBeNull();
    expect(formatRate(2)).toBe("2");
    expect(formatRate(2.5)).toBe("2.5");
  });
});

describe("fixtures", () => {
  it("has Leo on 1% a week, three days unpaid, balance unchanged until paid", () => {
    const s = makeFixtures(NOW);
    const leo = s.kids.find((k) => k.id === "kid-leo")!;
    expect(leo.interest).toMatchObject({ enabled: true, ratePercent: 1, per: "week", paidThrough: daysBefore(NOW, 3), carry: 0 });
    expect(balanceOf(s, "kid-leo")).toBe(3120);
    const due = interestDue(s, "kid-leo", NOW);
    expect(due.days).toBe(3);
    expect(due.cents).toBe(13);
    expect(s.kids.filter((k) => k.interest)).toHaveLength(1);
  });
});
