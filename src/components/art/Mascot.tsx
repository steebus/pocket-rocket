"use client";

import { useRef } from "react";
import { KID_COLORS } from "@/lib/kidColors";
import { useIdleLoop } from "@/lib/idle";
import type { KidColorId, MascotId } from "@/lib/types";
import styles from "./Mascot.module.css";
import { Svg48 } from "./Svg";

const W = "#fff";
const INK = "currentColor";

interface Eye {
  x: number;
  y: number;
  r: number;
  /** pupil centre and radius */
  px: number;
  py: number;
  pr: number;
}

/** A pair of round eyes, the pupils a touch low and toward the middle. */
function pair(y: number, gap: number, r: number): Eye[] {
  return [
    { x: 24 - gap, y, r, px: 24 - gap + 1, py: y + 1, pr: 1.6 },
    { x: 24 + gap, y, r, px: 24 + gap - 1, py: y + 1, pr: 1.6 },
  ];
}

const EYES: Record<MascotId, Eye[]> = {
  blob: pair(25, 7, 5),
  bean: [{ x: 24, y: 25, r: 7, px: 24, py: 26, pr: 2.2 }],
  cat: pair(26, 7, 4.5),
  bunny: pair(29, 7, 4.5),
  robot: [
    { x: 16.5, y: 25, r: 5.5, px: 17, py: 26, pr: 1.8 },
    { x: 31.5, y: 25, r: 5.5, px: 31, py: 26, pr: 1.8 },
  ],
  dino: pair(25, 8, 5),
};

/**
 * Eyes drawn as separate groups, plus two hidden closed-eye strokes per eye: a gentle line for blinks and
 * an upward arch for a squeezed-shut smile. Same shapes as before when nothing is asking for them.
 */
function Eyes({ id }: { id: MascotId }) {
  const eyes = EYES[id];
  return (
    <>
      {eyes.map((e, i) => (
        <g key={i} data-eye className={styles.eye}>
          <circle cx={e.x} cy={e.y} r={e.r} fill={W} />
          <circle className={styles.pupil} cx={e.px} cy={e.py} r={e.pr} fill={INK} stroke="none" />
        </g>
      ))}
      {eyes.map((e, i) => (
        <path
          key={`s${i}`}
          data-lid="shut"
          className={styles.shut}
          d={`M${e.x - e.r + 0.6} ${e.y + 0.4}Q${e.x} ${e.y + e.r * 0.55} ${e.x + e.r - 0.6} ${e.y + 0.4}`}
        />
      ))}
      {eyes.map((e, i) => (
        <path
          key={`h${i}`}
          className={styles.happy}
          d={`M${e.x - e.r + 0.6} ${e.y + e.r * 0.45}Q${e.x} ${e.y - e.r * 0.95} ${e.x + e.r - 0.6} ${e.y + e.r * 0.45}`}
        />
      ))}
    </>
  );
}

const BLINK_EASE = "ease-in-out";

/** Close the eyes for ~170ms; now and then blink twice. Starts and ends open. */
function blink(svg: SVGSVGElement) {
  if (svg.dataset.look) return; // a held expression wins
  const eyes = svg.querySelectorAll("[data-eye]");
  const lids = svg.querySelectorAll('[data-lid="shut"]');
  const times = Math.random() < 0.18 ? [0, 300] : [0];
  for (const delay of times) {
    const timing = { duration: 170, delay, easing: BLINK_EASE };
    eyes.forEach((el) =>
      el.animate(
        [
          { transform: "scaleY(1)", opacity: 1 },
          { transform: "scaleY(0.15)", opacity: 0, offset: 0.4 },
          { transform: "scaleY(0.15)", opacity: 0, offset: 0.6 },
          { transform: "scaleY(1)", opacity: 1 },
        ],
        timing,
      ),
    );
    lids.forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], timing));
  }
}

export function Mascot({
  id,
  color,
  size = 64,
  className,
  alive = false,
  look,
  gaze,
}: {
  id: MascotId;
  color: KidColorId;
  size?: number | string;
  className?: string;
  /** blink at irregular intervals (off by default: the parent area and the printable chart stay still) */
  alive?: boolean;
  /** hold an expression: squeezed-shut smile, or eyes wide open */
  look?: "happy" | "wide";
  /** where the pupils glance */
  gaze?: "down";
}) {
  const c = KID_COLORS[color].main;
  const svg = useRef<SVGSVGElement>(null);
  useIdleLoop(
    svg,
    () => {
      if (svg.current) blink(svg.current);
    },
    { min: 3000, max: 6000, first: [900, 4500], enabled: alive },
  );

  return (
    <Svg48 size={size} className={[styles.svg, className].filter(Boolean).join(" ")} ref={svg} data-look={look} data-gaze={gaze}>
      {id === "blob" && (
        <>
          <circle cx="12" cy="11" r="6" fill={c} />
          <circle cx="36" cy="11" r="6" fill={c} />
          <rect x="5" y="10" width="38" height="33" rx="15" fill={c} />
          <Eyes id="blob" />
          <path d="M19 35q5 4 10 0" />
        </>
      )}
      {id === "bean" && (
        <>
          <path d="M24 12V5" />
          <circle cx="24" cy="5" r="2.5" fill={W} />
          <ellipse cx="24" cy="28" rx="18" ry="16" fill={c} />
          <Eyes id="bean" />
          <path d="M18 37q6 4 12 0" />
        </>
      )}
      {id === "cat" && (
        <>
          <path d="M8 22V6l11 8M40 22V6l-11 8" fill={c} />
          <rect x="6" y="12" width="36" height="31" rx="14" fill={c} />
          <Eyes id="cat" />
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
          <Eyes id="bunny" />
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
          <Eyes id="robot" />
          <path d="M16 36h16M20 34v4M24 34v4M28 34v4" />
        </>
      )}
      {id === "dino" && (
        <>
          <path d="M11 14l3-8 4 8M20 12l4-9 4 9M30 14l4-8 3 8" fill={W} />
          <rect x="5" y="12" width="38" height="31" rx="15" fill={c} />
          <Eyes id="dino" />
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
