import { describe, expect, it } from "vitest";
import { changedFromRight } from "../hop";

describe("changedFromRight", () => {
  it("flags only the digits that changed, counted from the right", () => {
    expect([...changedFromRight("$5.00", "$5.50")]).toEqual([1]);
    expect([...changedFromRight("$5.99", "$6.49")].sort()).toEqual([1, 3]);
  });
  it("keeps the cents aligned when the length grows", () => {
    const c = changedFromRight("$9.99", "$10.00");
    expect(c.has(0) && c.has(1) && c.has(3) && c.has(4)).toBe(true);
    expect(c.has(2)).toBe(false);
  });
});
