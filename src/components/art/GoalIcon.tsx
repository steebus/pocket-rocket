import type { GoalIconId } from "@/lib/types";
import { Svg48 } from "./Svg";

export const GOAL_ICONS: { id: GoalIconId; label: string }[] = [
  { id: "scooter", label: "Scooter" },
  { id: "kite", label: "Kite" },
  { id: "bike", label: "Bike" },
  { id: "ball", label: "Ball" },
  { id: "teddy", label: "Teddy" },
  { id: "blocks", label: "Blocks" },
  { id: "game", label: "Game" },
  { id: "book", label: "Book" },
];

export function GoalIcon({ id, size = 48 }: { id: GoalIconId; size?: number | string }) {
  return (
    <Svg48 size={size}>
      {id === "scooter" && (
        <>
          <path d="M10 37h22L27 8h9" />
          <rect x="8" y="33" width="26" height="5" rx="2.5" fill="#7b5cff" />
          <circle cx="10" cy="39" r="5" fill="#fff" />
          <circle cx="38" cy="39" r="5" fill="#ff7a59" />
          <path d="M32 37l1.5 2" />
        </>
      )}
      {id === "kite" && (
        <>
          <path d="M24 40q-8 2-4 5t6 1" />
          <path d="M24 4l14 16-14 20-14-20z" fill="#ff7eb6" />
          <path d="M24 4v36M10 20h28" />
          <path d="M21 44l-3-2v4zM28 46l3-3v4z" fill="#ffc83d" />
        </>
      )}
      {id === "bike" && (
        <>
          <circle cx="11" cy="33" r="8" fill="#fff" />
          <circle cx="37" cy="33" r="8" fill="#fff" />
          <path d="M11 33l8-14h13l5 14M19 19l7 14M15 13h7M31 19l-2-7h5" />
          <circle cx="26" cy="33" r="2.5" fill="#ffc83d" />
        </>
      )}
      {id === "ball" && (
        <>
          <circle cx="24" cy="24" r="18" fill="#fff" />
          <path d="M24 15l8 6-3 9h-10l-3-9z" fill="#12312a" />
          <path d="M24 15V6M32 21l9-3M29 30l5 8M19 30l-5 8M16 21l-9-3" />
        </>
      )}
      {id === "teddy" && (
        <>
          <circle cx="10" cy="11" r="6.5" fill="#e79a12" />
          <circle cx="38" cy="11" r="6.5" fill="#e79a12" />
          <circle cx="24" cy="25" r="17" fill="#e79a12" />
          <ellipse cx="24" cy="30" rx="8" ry="6" fill="#fff1c2" />
          <ellipse cx="24" cy="28" rx="2.8" ry="2" fill="#12312a" />
          <circle cx="17" cy="21" r="1.8" fill="#12312a" stroke="none" />
          <circle cx="31" cy="21" r="1.8" fill="#12312a" stroke="none" />
          <path d="M24 30v2q-2 2-4 1M24 32q2 2 4 1" />
        </>
      )}
      {id === "blocks" && (
        <>
          <rect x="4" y="26" width="19" height="16" rx="3" fill="#ff7a59" />
          <rect x="25" y="26" width="19" height="16" rx="3" fill="#7b5cff" />
          <rect x="14" y="9" width="19" height="16" rx="3" fill="#ffc83d" />
          <path d="M23.5 14l3.5 7M20 21h6" />
        </>
      )}
      {id === "game" && (
        <>
          <rect x="3" y="14" width="42" height="23" rx="11.5" fill="#7b5cff" />
          <path d="M14 21v10M9 26h10" stroke="#fff" />
          <circle cx="32" cy="23.5" r="2.8" fill="#ffc83d" />
          <circle cx="38" cy="28.5" r="2.8" fill="#3ddc84" />
        </>
      )}
      {id === "book" && (
        <>
          <path d="M6 10h15c2 0 3 1 3 3v28c0-2-1-3-3-3H6z" fill="#ff7a59" />
          <path d="M42 10H27c-2 0-3 1-3 3v28c0-2 1-3 3-3h15z" fill="#fff" />
          <path d="M29 18h8M29 25h8" />
        </>
      )}
    </Svg48>
  );
}
