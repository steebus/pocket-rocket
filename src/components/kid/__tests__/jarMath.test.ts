import { describe, expect, it } from "vitest";
import { CAP, coinsFor, coinUnit, goalCoins, jarHeight, lineY, slotOf } from "../jarMath";

const goal = { name: "Scooter", icon: "scooter" as const, priceCents: 4000 };

describe("jarMath", () => {
  it("is deterministic and stable when coins are added", () => {
    expect(slotOf(5)).toEqual(slotOf(5));
    expect(slotOf(3).x).toBe(slotOf(3).x);
  });
  it("never counts more than the cap", () => {
    expect(coinsFor(1_000_000)).toBe(CAP);
    expect(coinsFor(0)).toBe(0);
    expect(coinsFor(10)).toBe(1);
  });
  it("keeps the pile under the line until the goal is met", () => {
    const gc = goalCoins(goal);
    expect(coinsFor(3990, goal)).toBeLessThan(gc);
    expect(coinsFor(4000, goal)).toBe(gc);
    expect(coinUnit(goal)).toBeGreaterThan(50);
  });
  it("sizes the jar around the goal line", () => {
    expect(jarHeight(goal)).toBeGreaterThan(lineY(goal));
  });
});
