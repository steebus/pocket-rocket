import { formatCents } from "@/lib/money";
import type { Repeat } from "@/lib/types";

export const REPEAT_LABEL: Record<Repeat, string> = {
  daily: "Every day",
  weekly: "Every week",
  once: "Once",
};

/** "+$2.00" / "-$1.50": the sign is always written, never left to colour. */
export function signed(cents: number): string {
  return `${cents > 0 ? "+" : ""}${formatCents(cents)}`;
}

/** "12.5" for editing, without trailing ".00". */
export function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

export function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
