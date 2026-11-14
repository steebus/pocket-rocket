import type { Interest, InterestPer, Kid, PocketState } from "./types";

/** Pure interest rules. Interest compounds daily on the kid's current balance. */

export const MAX_DAYS = 366;
export const MAX_RATE = 100;
export const PER_DAYS: Record<InterestPer, number> = { week: 7, month: 30, year: 365 };
export const PER_LABEL: Record<InterestPer, string> = { week: "a week", month: "a month", year: "a year" };
export const PER_EVERY: Record<InterestPer, string> = { week: "every week", month: "every month", year: "every year" };
export const DEFAULT_INTEREST = { ratePercent: 1, per: "week" as InterestPer };

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** The start of the local day `n` days before the start of `ts`'s day (DST safe). */
export function daysBefore(ts: number, n: number): number {
  const d = new Date(startOfDay(ts));
  d.setDate(d.getDate() - n);
  return d.getTime();
}

/** Whole local calendar days from `from` (a day start) to the start of today's day. */
function daysBetween(from: number, now: number): number {
  const a = new Date(from);
  const b = new Date(startOfDay(now));
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
}

export function dailyRate(interest: Pick<Interest, "ratePercent" | "per">): number {
  return interest.ratePercent / 100 / PER_DAYS[interest.per];
}

/** null when the rate is fine, otherwise a plain message for the parent. */
export function rateError(rate: number | null, per: InterestPer): string | null {
  if (rate === null || !Number.isFinite(rate)) return "Enter a rate like 1 or 2.5.";
  if (rate <= 0) return "The rate needs to be more than 0%.";
  if (rate > MAX_RATE) return `The most you can enter is ${MAX_RATE}% ${PER_LABEL[per]}.`;
  return null;
}

/** "2", "2.5", ".5" to a number; null if it is not a plain decimal. */
export function parseRate(input: string): number | null {
  const s = input.trim().replace(/%$/, "").trim();
  if (!/^(\d+(\.\d+)?|\.\d+)$/.test(s)) return null;
  return Number(s);
}

/** "1", "2.5": a rate without trailing zeros. */
export function formatRate(rate: number): string {
  return String(Number(rate.toFixed(4)));
}

export function kidInterest(kid: Kid | undefined): Interest | null {
  return kid?.interest?.enabled ? kid.interest : null;
}

export interface InterestDue {
  days: number;
  cents: number;
  carry: number;
}

const NONE: InterestDue = { days: 0, cents: 0, carry: 0 };

/** What is owed to a kid as of `now`. Owed = balance x ((1 + daily)^days - 1) + previous carry. */
export function interestDue(state: PocketState, kidId: string, now: number): InterestDue {
  const kid = state.kids.find((k) => k.id === kidId);
  const i = kidInterest(kid);
  if (!i) return NONE;
  const days = Math.min(MAX_DAYS, Math.max(0, daysBetween(i.paidThrough, now)));
  const carry = Number.isFinite(i.carry) ? Math.min(Math.max(i.carry, 0), 0.999999) : 0;
  if (days === 0) return { days: 0, cents: 0, carry };
  const balance = Math.max(
    0,
    state.txns.reduce((sum, t) => (t.kidId === kidId ? sum + t.amountCents : sum), 0),
  );
  const owed = balance * (Math.pow(1 + dailyRate(i), days) - 1) + carry;
  // The epsilon keeps 0.9999999999 from floor-ing down to the wrong cent.
  const cents = Math.floor(owed + 1e-9);
  return { days, cents, carry: Math.min(Math.max(owed - cents, 0), 0.999999) };
}

/** True when this kid has had any interest paid. */
export function hasEarnedInterest(state: PocketState, kidId: string): boolean {
  return state.txns.some((t) => t.kidId === kidId && t.type === "interest" && t.amountCents > 0);
}
