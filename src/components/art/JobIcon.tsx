import type { JobIconId } from "@/lib/types";
import { Svg48 } from "./Svg";

export const JOB_ICONS: { id: JobIconId; label: string }[] = [
  { id: "bed", label: "Bed" },
  { id: "bowl", label: "Pet food" },
  { id: "brush", label: "Teeth" },
  { id: "toys", label: "Toys" },
  { id: "dishes", label: "Dishes" },
  { id: "plant", label: "Plants" },
  { id: "rubbish", label: "Rubbish" },
  { id: "laundry", label: "Laundry" },
  { id: "table", label: "Table" },
  { id: "shoes", label: "Shoes" },
  { id: "book", label: "Book" },
  { id: "bag", label: "Bag" },
  { id: "bath", label: "Bath" },
  { id: "sweep", label: "Sweep" },
  { id: "car", label: "Car" },
  { id: "pet", label: "Pet" },
];

export function JobIcon({ id, size = 48 }: { id: JobIconId; size?: number | string }) {
  return (
    <Svg48 size={size}>
      {id === "bed" && (
        <>
          <path d="M7 36v6M41 36v6" />
          <rect x="4" y="22" width="40" height="15" rx="5" fill="#7b5cff" />
          <rect x="8" y="14" width="15" height="11" rx="5" fill="#fff" />
        </>
      )}
      {id === "bowl" && (
        <>
          <path d="M7 24h34l-5 16H12z" fill="#ff7a59" />
          <ellipse cx="24" cy="24" rx="17" ry="5" fill="#9a623e" />
          <circle cx="17" cy="12" r="2" fill="#9a623e" />
          <circle cx="26" cy="8" r="2" fill="#9a623e" />
          <circle cx="32" cy="14" r="2" fill="#9a623e" />
        </>
      )}
      {id === "brush" && (
        <>
          <g transform="rotate(-35 24 24)">
            <rect x="3" y="22" width="42" height="8" rx="4" fill="#3ddc84" />
            <rect x="30" y="11" width="13" height="11" rx="3" fill="#fff" />
          </g>
          <path d="M10 8v6M7 11h6" />
        </>
      )}
      {id === "toys" && (
        <>
          <rect x="5" y="21" width="21" height="21" rx="5" fill="#ffc83d" />
          <circle cx="33" cy="17" r="11" fill="#ff7eb6" />
          <path d="M23 14q10 4 20 0" />
        </>
      )}
      {id === "dishes" && (
        <>
          <circle cx="24" cy="29" r="14" fill="#fff" />
          <circle cx="24" cy="29" r="7" fill="#eafff5" />
          <circle cx="9" cy="11" r="4.5" fill="#7fd4ff" />
          <circle cx="21" cy="6" r="3" fill="#7fd4ff" />
          <circle cx="37" cy="11" r="4" fill="#7fd4ff" />
        </>
      )}
      {id === "plant" && (
        <>
          <path d="M24 30V18" />
          <path d="M24 24c-8 0-12-5-12-12 8 0 12 4 12 12z" fill="#3ddc84" />
          <path d="M24 19c0-6 4-10 12-10 0 7-5 10-12 10z" fill="#3ddc84" />
          <path d="M13 30h22l-3 13H16z" fill="#ff7a59" />
        </>
      )}
      {id === "rubbish" && (
        <>
          <path d="M20 8V5h8v3" />
          <path d="M11 15h26l-3 28H14z" fill="#7fd4ff" />
          <rect x="8" y="9" width="32" height="6" rx="3" fill="#fff" />
          <path d="M19 22v15M29 22v15" />
        </>
      )}
      {id === "laundry" && (
        <>
          <path d="M17 6L5 14l5 8 6-3v24h16V19l6 3 5-8-12-8q-3 5-8 0z" fill="#7fd4ff" />
          <path d="M18 6q6 6 12 0" />
        </>
      )}
      {id === "table" && (
        <>
          <path d="M10 32v10M38 32v10" />
          <rect x="4" y="27" width="40" height="6" rx="3" fill="#ffc83d" />
          <ellipse cx="24" cy="22" rx="10" ry="4" fill="#fff" />
          <path d="M8 8v10M5 8v4q0 2 3 2t3-2V8M42 8v10M42 8q-3 3-3 8h3" />
        </>
      )}
      {id === "shoes" && (
        <>
          <path d="M6 10h10v11c0 4 3 6 8 7l13 3c4 1 6 3 6 6v3H6z" fill="#3ddc84" />
          <path d="M6 37h37" strokeWidth={5} />
          <path d="M18 21l4-3M23 25l4-3" />
        </>
      )}
      {id === "book" && (
        <>
          <path d="M6 10h15c2 0 3 1 3 3v28c0-2-1-3-3-3H6z" fill="#7b5cff" />
          <path d="M42 10H27c-2 0-3 1-3 3v28c0-2 1-3 3-3h15z" fill="#fff" />
          <path d="M29 18h8M29 25h8" />
        </>
      )}
      {id === "bag" && (
        <>
          <path d="M17 14v-3a7 7 0 0 1 14 0v3" />
          <rect x="8" y="14" width="32" height="30" rx="10" fill="#ff7eb6" />
          <rect x="14" y="29" width="20" height="10" rx="4" fill="#ffd9cf" />
          <path d="M24 29v4" />
        </>
      )}
      {id === "bath" && (
        <>
          <path d="M11 25V12a4 4 0 0 1 8 0" />
          <path d="M4 25h40v3c0 8-5 14-14 14H18C9 42 4 36 4 28z" fill="#7fd4ff" />
          <circle cx="30" cy="15" r="4.5" fill="#fff" />
          <circle cx="39" cy="9" r="3" fill="#fff" />
          <path d="M12 42l-2 3M36 42l2 3" />
        </>
      )}
      {id === "sweep" && (
        <>
          <g transform="rotate(30 24 24)">
            <rect x="21.5" y="1" width="5" height="26" rx="2.5" fill="#ffc83d" />
            <path d="M13 28h22l4 16H9z" fill="#ff7a59" />
            <path d="M18 35v6M24 35v6M30 35v6" />
          </g>
          <path d="M6 13v6M3 16h6" />
        </>
      )}
      {id === "car" && (
        <>
          <path d="M11 23l5-10h16l5 10z" fill="#7fd4ff" />
          <rect x="4" y="22" width="40" height="15" rx="6" fill="#ff7a59" />
          <circle cx="14" cy="38" r="5.5" fill="#fff" />
          <circle cx="34" cy="38" r="5.5" fill="#fff" />
          <path d="M40 28h1" strokeWidth={5} />
        </>
      )}
      {id === "pet" && (
        <>
          <ellipse cx="24" cy="32" rx="11" ry="9" fill="#9a623e" />
          <circle cx="10" cy="22" r="4.5" fill="#9a623e" />
          <circle cx="19" cy="13" r="4.5" fill="#9a623e" />
          <circle cx="29" cy="13" r="4.5" fill="#9a623e" />
          <circle cx="38" cy="22" r="4.5" fill="#9a623e" />
        </>
      )}
    </Svg48>
  );
}
