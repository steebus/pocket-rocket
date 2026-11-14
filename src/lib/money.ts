/** Money is always integer cents. */

/** 1250 -> "$12.50", -200 -> "-$2.00" */
export function formatCents(cents: number): string {
  const c = Math.round(cents);
  const abs = Math.abs(c);
  const dollars = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${c < 0 ? "-" : ""}$${dollars}.${rest}`;
}

/** 50 -> "50c", 100 -> "$1", 150 -> "$1.50" */
export function formatShort(cents: number): string {
  const c = Math.round(cents);
  const abs = Math.abs(c);
  const sign = c < 0 ? "-" : "";
  if (abs < 100) return `${sign}${abs}c`;
  if (abs % 100 === 0) return `${sign}$${abs / 100}`;
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** "12.5" or "$12.50" to cents. Returns null when not a valid amount. */
export function parseDollars(input: string): number | null {
  const s = input.trim().replace(/^\$/, "").replace(/,/g, "").trim();
  if (!/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(s)) return null;
  const [d = "0", f = ""] = s.split(".");
  return Number(d || "0") * 100 + Number(f.padEnd(2, "0") || "0");
}
