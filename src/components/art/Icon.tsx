import { Svg48 } from "./Svg";

export type IconName =
  | "check" | "x" | "plus" | "minus" | "star" | "flame" | "lock" | "unlock" | "kids" | "list" | "cog"
  | "coin" | "back" | "speaker" | "clock" | "gift" | "cart" | "trash" | "edit" | "home" | "target";

/** UI glyphs. Stroke follows `currentColor` (set `color` on the parent); star, flame and coin carry their own fill. */
export function Icon({
  name,
  size = 24,
  strokeWidth = 4,
  className,
}: {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <Svg48 size={size} strokeWidth={strokeWidth} className={className} style={{ color: "currentColor" }}>
      {name === "check" && <path d="M9 25l10 10 20-22" />}
      {name === "x" && <path d="M12 12l24 24M36 12L12 36" />}
      {name === "plus" && <path d="M24 9v30M9 24h30" />}
      {name === "minus" && <path d="M9 24h30" />}
      {name === "star" && <path d="M24 5l6 13 14 1-11 10 4 14-13-8-13 8 4-14L4 19l14-1z" fill="#ffc83d" />}
      {name === "flame" && (
        <path d="M24 4c2 10 12 13 12 25a12 12 0 0 1-24 0c0-6 4-9 5-14 3 2 4 5 4 8 3-5 4-11 3-19z" fill="#ff7a59" />
      )}
      {name === "lock" && (
        <>
          <rect x="9" y="21" width="30" height="22" rx="6" />
          <path d="M15 21v-6a9 9 0 0 1 18 0v6" />
        </>
      )}
      {name === "unlock" && (
        <>
          <rect x="9" y="21" width="30" height="22" rx="6" />
          <path d="M15 21v-6a9 9 0 0 1 17-4" />
        </>
      )}
      {name === "kids" && (
        <>
          <circle cx="17" cy="18" r="8" />
          <circle cx="34" cy="22" r="6" />
          <path d="M4 42c0-9 6-13 13-13s13 4 13 13M33 32c6 0 11 3 11 10" />
        </>
      )}
      {name === "list" && <path d="M8 13l4 4 7-8M8 31l4 4 7-8M26 14h14M26 32h14" />}
      {name === "cog" && (
        <>
          <circle cx="24" cy="24" r="7" />
          <path d="M24 5v7M24 36v7M5 24h7M36 24h7M11 11l5 5M32 32l5 5M37 11l-5 5M16 32l-5 5" />
        </>
      )}
      {name === "coin" && (
        <>
          <circle cx="24" cy="24" r="18" />
          <path d="M29 18c-2-3-10-3-10 2s10 3 10 8-8 5-11 2M24 12v24" />
        </>
      )}
      {name === "back" && <path d="M30 8L14 24l16 16" />}
      {name === "speaker" && (
        <>
          <path d="M6 19h8l10-9v28l-10-9H6z" />
          <path d="M31 17q5 7 0 14M37 11q10 13 0 26" />
        </>
      )}
      {name === "clock" && (
        <>
          <circle cx="24" cy="24" r="18" />
          <path d="M24 13v11l7 5" />
        </>
      )}
      {name === "gift" && (
        <>
          <rect x="6" y="18" width="36" height="8" rx="3" />
          <path d="M10 26v15h28V26M24 18v23" />
          <path d="M24 18c-4-1-10-2-10-7s7-4 10 7zM24 18c4-1 10-2 10-7s-7-4-10 7z" />
        </>
      )}
      {name === "cart" && (
        <>
          <path d="M4 7h7l5 22h21l4-16H13" />
          <circle cx="19" cy="38" r="3" />
          <circle cx="34" cy="38" r="3" />
        </>
      )}
      {name === "trash" && (
        <>
          <path d="M6 12h36M18 12V7h12v5M10 12l2 30h24l2-30M20 20v14M28 20v14" />
        </>
      )}
      {name === "edit" && <path d="M8 40l2-9L32 9l7 7-22 22zM27 14l7 7" />}
      {name === "home" && <path d="M6 23L24 7l18 16M11 19v22h26V19M20 41V29h8v12" />}
      {name === "target" && (
        <>
          <circle cx="24" cy="24" r="18" />
          <circle cx="24" cy="24" r="9" />
          <circle cx="24" cy="24" r="2" fill="currentColor" />
        </>
      )}
    </Svg48>
  );
}
