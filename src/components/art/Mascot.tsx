import { KID_COLORS } from "@/lib/kidColors";
import type { KidColorId, MascotId } from "@/lib/types";
import { Svg48 } from "./Svg";

const W = "#fff";
const INK = "currentColor";

function Face({ y = 26, gap = 7, r = 5 }: { y?: number; gap?: number; r?: number }) {
  return (
    <>
      <circle cx={24 - gap} cy={y} r={r} fill={W} />
      <circle cx={24 + gap} cy={y} r={r} fill={W} />
      <circle cx={24 - gap + 1} cy={y + 1} r={1.6} fill={INK} stroke="none" />
      <circle cx={24 + gap - 1} cy={y + 1} r={1.6} fill={INK} stroke="none" />
    </>
  );
}

export function Mascot({
  id,
  color,
  size = 64,
  className,
}: {
  id: MascotId;
  color: KidColorId;
  size?: number | string;
  className?: string;
}) {
  const c = KID_COLORS[color].main;
  return (
    <Svg48 size={size} className={className}>
      {id === "blob" && (
        <>
          <circle cx="12" cy="11" r="6" fill={c} />
          <circle cx="36" cy="11" r="6" fill={c} />
          <rect x="5" y="10" width="38" height="33" rx="15" fill={c} />
          <Face y={25} gap={7} />
          <path d="M19 35q5 4 10 0" />
        </>
      )}
      {id === "bean" && (
        <>
          <path d="M24 12V5" />
          <circle cx="24" cy="5" r="2.5" fill={W} />
          <ellipse cx="24" cy="28" rx="18" ry="16" fill={c} />
          <circle cx="24" cy="25" r="7" fill={W} />
          <circle cx="24" cy="26" r="2.2" fill={INK} stroke="none" />
          <path d="M18 37q6 4 12 0" />
        </>
      )}
      {id === "cat" && (
        <>
          <path d="M8 22V6l11 8M40 22V6l-11 8" fill={c} />
          <rect x="6" y="12" width="36" height="31" rx="14" fill={c} />
          <Face y={26} gap={7} r={4.5} />
          <path d="M21 35l3 2 3-2" />
          <path d="M3 30h5M3 35l5-1M45 30h-5M45 35l-5-1" />
        </>
      )}
      {id === "bunny" && (
        <>
          <rect x="11" y="2" width="9" height="22" rx="4.5" fill={c} />
          <rect x="28" y="2" width="9" height="22" rx="4.5" fill={c} />
          <path d="M15.5 8v10M32.5 8v10" />
          <rect x="6" y="15" width="36" height="28" rx="14" fill={c} />
          <Face y={29} gap={7} r={4.5} />
          <path d="M22 36h4l-2 2z" fill={INK} />
          <path d="M24 38v2M20 41q4 3 8 0" />
        </>
      )}
      {id === "robot" && (
        <>
          <path d="M24 12V5" />
          <circle cx="24" cy="5" r="2.5" fill="#ff7a59" />
          <rect x="2" y="23" width="5" height="11" rx="2.5" fill={W} />
          <rect x="41" y="23" width="5" height="11" rx="2.5" fill={W} />
          <rect x="6" y="12" width="36" height="31" rx="10" fill={c} />
          <circle cx="16.5" cy="25" r="5.5" fill={W} />
          <circle cx="31.5" cy="25" r="5.5" fill={W} />
          <circle cx="17" cy="26" r="1.8" fill={INK} stroke="none" />
          <circle cx="31" cy="26" r="1.8" fill={INK} stroke="none" />
          <path d="M16 36h16M20 34v4M24 34v4M28 34v4" />
        </>
      )}
      {id === "dino" && (
        <>
          <path d="M11 14l3-8 4 8M20 12l4-9 4 9M30 14l4-8 3 8" fill={W} />
          <rect x="5" y="12" width="38" height="31" rx="15" fill={c} />
          <Face y={25} gap={8} />
          <circle cx="21.5" cy="32" r="1" fill={INK} />
          <circle cx="26.5" cy="32" r="1" fill={INK} />
          <path d="M16 37q8 5 16 0" />
          <path d="M20 39.5v2.5M28 39.5v2.5" />
        </>
      )}
    </Svg48>
  );
}

export const MASCOT_IDS: MascotId[] = ["blob", "bean", "cat", "bunny", "robot", "dino"];
