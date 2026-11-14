"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/art/Icon";
import { Mascot } from "@/components/art/Mascot";
import { KidProvider } from "@/components/kid/KidContext";
import { ButtonLink } from "@/components/ui/Button";
import { KID_COLORS } from "@/lib/kidColors";
import { streakOf } from "@/lib/selectors";
import { usePocket } from "@/lib/store";
import styles from "./layout.module.css";

const TABS: { path: string; icon: IconName; label: string }[] = [
  { path: "", icon: "jar", label: "Jar" },
  { path: "/goal", icon: "target", label: "Goal" },
  { path: "/stuff", icon: "star", label: "My stuff" },
];

export default function KidLayout({ children }: { children: ReactNode }) {
  const { kidId } = useParams<{ kidId: string }>();
  const pathname = usePathname();
  const { state, ready } = usePocket();
  const reduce = useReducedMotion();
  const kid = state.kids.find((k) => k.id === kidId);

  if (!ready) return <div className={styles.waiting} aria-hidden="true" />;

  if (!kid) {
    return (
      <main className={styles.lost}>
        <Mascot id="blob" color="sky" size={140} />
        <h1>Hmm, I can&apos;t find that player.</h1>
        <p>Let&apos;s go back and tap your face.</p>
        <ButtonLink href="/" variant="primary" size="kid" pill>
          Who&apos;s playing?
        </ButtonLink>
      </main>
    );
  }

  const color = KID_COLORS[kid.color];
  const streak = streakOf(state, kid.id, Date.now());
  const base = `/kid/${kid.id}`;
  const current = TABS.findIndex((t) => pathname === base + t.path);

  return (
    <KidProvider value={kid}>
      <div
        className={styles.shell}
        style={{ ["--kid" as string]: color.main, ["--kid-ground" as string]: color.ground }}
      >
        <header className={styles.top}>
          <Link href="/" className={styles.who} aria-label={`${kid.name}. Tap to pick who is playing`}>
            <motion.span
              className={styles.face}
              animate={reduce ? undefined : { y: [0, -4, 0] }}
              transition={reduce ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mascot id={kid.mascot} color={kid.color} size="100%" />
            </motion.span>
            <span className={styles.name}>{kid.name}</span>
          </Link>
          {streak > 0 && (
            <Link href={`${base}/stuff`} className={styles.streak} aria-label={`${streak} day streak`}>
              <Icon name="flame" size={28} strokeWidth={3.5} />
              <span data-money>{streak}</span>
            </Link>
          )}
        </header>

        <div className={styles.main}>{children}</div>

        <nav className={styles.nav} aria-label="Pages">
          {TABS.map((t, i) => (
            <Link
              key={t.path}
              href={base + t.path}
              className={styles.item}
              aria-current={i === current ? "page" : undefined}
            >
              <Icon name={t.icon} size={30} strokeWidth={4} />
              <span className={styles.sr}>{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </KidProvider>
  );
}
