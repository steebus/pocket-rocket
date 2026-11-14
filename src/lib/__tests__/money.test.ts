import { describe, expect, it } from "vitest";
import { formatCents, formatShort, parseDollars } from "../money";

describe("formatCents", () => {
  it("formats dollars and cents", () => {
    expect(formatCents(1250)).toBe("$12.50");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(5)).toBe("$0.05");
    expect(formatCents(100000)).toBe("$1000.00");
  });
  it("formats negatives", () => {
    expect(formatCents(-200)).toBe("-$2.00");
    expect(formatCents(-5)).toBe("-$0.05");
  });
});

describe("formatShort", () => {
  it("uses cents under a dollar, whole dollars when round", () => {
    expect(formatShort(50)).toBe("50c");
    expect(formatShort(20)).toBe("20c");
    expect(formatShort(100)).toBe("$1");
    expect(formatShort(150)).toBe("$1.50");
    expect(formatShort(4000)).toBe("$40");
  });
});

describe("parseDollars", () => {
  it("parses to cents", () => {
    expect(parseDollars("12.50")).toBe(1250);
    expect(parseDollars("$3")).toBe(300);
    expect(parseDollars("0.5")).toBe(50);
    expect(parseDollars(".25")).toBe(25);
    expect(parseDollars(" 1,000 ")).toBe(100000);
  });
  it("rejects junk", () => {
    expect(parseDollars("")).toBeNull();
    expect(parseDollars("abc")).toBeNull();
    expect(parseDollars("1.234")).toBeNull();
    expect(parseDollars("-3")).toBeNull();
  });
});
