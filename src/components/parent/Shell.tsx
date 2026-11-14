"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/art/Icon";
import { Coin } from "@/components/ui/Coin";
import { useParentLock } from "@/lib/store";
import styles from "./Shell.module.css";

const NAV: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/parent", label: "Kids", icon: "kids", match: (p) => p === "/parent" || p.startsWith("/parent/kids") },
  { href: "/parent/jobs", label: "Jobs", icon: "list", match: (p) => p.startsWith("/parent/jobs") },
  { href: "/parent/settings", label: "Settings", icon: "cog", match: (p) => p.startsWith("/parent/settings") },
];

export function Shell({ children }: { children: ReactNode }) {
  const { lock } = useParentLock();
  const router = useRouter();
  const pathname = usePathname() ?? "/parent";

  return (
    <div className={styles.app}>
      <title>Pocket Rocket: Parents</title>
      <header className={styles.bar}>
        <div className={styles.barIn}>
          <span className={styles.brand}>
            <Coin size={30} />
            Pocket Rocket
          </span>
          <button
            type="button"
            className={styles.lockBtn}
            onClick={() => {
              lock();
              router.push("/");
            }}
          >
            <Icon name="lock" size={20} />
            Lock
          </button>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.nav} aria-label="Parent sections">
        <ul className={styles.navList}>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.link}
                aria-current={item.match(pathname) ? "page" : undefined}
              >
                <Icon name={item.icon} size={22} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
