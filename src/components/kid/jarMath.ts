import type { Goal } from "@/lib/types";

/**
 * Jar geometry. Everything is in "cqw": 1% of the jar's width, so the pile scales with the jar.
 * Coins are packed in hex rows from the bottom; inside a row they fill from the middle outwards,
 * so a half-full row is one tidy clump and coins already placed never move when one is added.
 */
export const COIN = 11.2;
const PITCH_X = 11.6;
const PITCH_Y = 10;
const BASE = 1.8;
const ROWS = [7, 8, 7, 8, 7];
export const CAP = ROWS.reduce((a, b) => a + b, 0);
const MAX_GOAL_COINS = 34;
export const NO_GOAL_HEIGHT = 58;

function frac(i: number, salt: number): number {
  const h = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

function centerOut(n: number): number[] {
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, s) => s).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b);
}

export interface Slot {
  /** centre of the coin, % of jar width */
  x: number;
  /** distance from the glass floor to the coin's bottom edge, cqw */
  y: number;
  tilt: number;
  row: number;
}

export function slotOf(i: number): Slot {
  let row = 0;
  let k = Math.min(Math.max(0, i), CAP - 1);
  while (k >= ROWS[row]) {
    k -= ROWS[row];
    row++;
  }
  const n = ROWS[row];
  const s = centerOut(n)[k];
  return {
    x: 50 + (s - (n - 1) / 2) * PITCH_X + (frac(i, 1) - 0.5) * 1,
    y: BASE + row * PITCH_Y + (frac(i, 2) - 0.5) * 0.6,
    tilt: Math.round((frac(i, 3) - 0.5) * 32),
    row,
  };
}

/** One coin stands for this many cents. Bigger goals use bigger coins so the pile never outgrows the jar. */
export function coinUnit(goal?: Goal): number {
  if (!goal || goal.priceCents <= 0) return 50;
  return 50 * Math.max(1, Math.ceil(goal.priceCents / 50 / MAX_GOAL_COINS));
}

export function goalCoins(goal: Goal): number {
  return Math.max(1, Math.ceil(goal.priceCents / coinUnit(goal)));
}

/** Coins in the pile for a balance. Stays under the goal line until the goal is truly met. */
export function coinsFor(cents: number, goal?: Goal): number {
  if (cents <= 0) return 0;
  const unit = coinUnit(goal);
  const raw = Math.max(1, Math.round(cents / unit));
  if (goal && goal.priceCents > 0) {
    const gc = goalCoins(goal);
    if (cents >= goal.priceCents) return Math.min(CAP, Math.max(gc, raw));
    return Math.min(raw, Math.max(1, gc - 1));
  }
  return Math.min(CAP, raw);
}

/** Height of the dashed goal line above the glass floor, cqw. */
export function lineY(goal: Goal): number {
  return BASE + slotOf(goalCoins(goal) - 1).row * PITCH_Y + COIN + 0.9;
}

/** Glass height in cqw: just tall enough for the goal line and its tag. */
export function jarHeight(goal?: Goal): number {
  return goal ? Math.max(46, lineY(goal) + 15) : NO_GOAL_HEIGHT;
}
