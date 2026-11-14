import { Icon } from "@/components/art/Icon";
import styles from "./BadgeMedal.module.css";

const LOOK: Record<string, { fill: string; icon?: "check" | "target" | "cart" | "flame" | "sprout"; text?: string; over?: string }> = {
  "first-job": { fill: "var(--ok)", icon: "check" },
  "ten-jobs": { fill: "var(--violet)", text: "10" },
  "streak-3": { fill: "var(--tint-coral)", icon: "flame", over: "3" },
  "streak-7": { fill: "var(--coral)", icon: "flame", over: "7" },
  "saved-10": { fill: "var(--gold)", text: "$10" },
  "saved-25": { fill: "var(--gold)", text: "$25" },
  goal: { fill: "var(--tint-violet)", icon: "target" },
  "money-grew": { fill: "var(--glass)", icon: "sprout" },
  "first-spend": { fill: "var(--tint-gold)", icon: "cart" },
};

/** A sticker-like medallion. Earned ones are full colour; unearned are an empty dashed outline. */
export function BadgeMedal({ id, earned, tilt }: { id: string; earned: boolean; tilt: number }) {
  const look = LOOK[id] ?? { fill: "var(--gold)", icon: "check" as const };
  return (
    <span
      className={styles.medal}
      data-earned={earned ? "yes" : "no"}
      style={{ ["--fill" as string]: look.fill, ["--tilt" as string]: `${tilt}deg`, color: id === "ten-jobs" && earned ? "var(--white)" : "var(--ink)" }}
      aria-hidden="true"
    >
      {look.icon && (
        <span className={styles.glyph}>
          <Icon name={look.icon} size={look.icon === "flame" ? 50 : 44} strokeWidth={look.icon === "flame" ? 3.5 : 4.5} />
          {look.over && <span className={styles.over}>{look.over}</span>}
        </span>
      )}
      {look.text && <span className={styles.text}>{look.text}</span>}
    </span>
  );
}
