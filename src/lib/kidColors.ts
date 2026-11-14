import type { KidColorId } from "./types";

/** `main` is the kid's colour; `ground` is a lighter tint for their screen background. */
export const KID_COLORS: Record<KidColorId, { label: string; main: string; ground: string }> = {
  pink: { label: "Pink", main: "#ff7eb6", ground: "#ffe0ee" },
  sky: { label: "Sky", main: "#7fd4ff", ground: "#dff4ff" },
  lime: { label: "Lime", main: "#c6f24e", ground: "#eefbc4" },
  orange: { label: "Orange", main: "#ff8a3d", ground: "#ffe3cf" },
  violet: { label: "Violet", main: "#b59bff", ground: "#e9e1ff" },
  yellow: { label: "Yellow", main: "#ffd23f", ground: "#fff3c4" },
};
