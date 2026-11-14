"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

let lastTab: number | null = null;

/** Remounts on every tab change: the new tab slides in from the side it sits on in the nav. */
export default function KidTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const tab = pathname.endsWith("/goal") ? 1 : pathname.endsWith("/stuff") ? 2 : 0;
  const dir = lastTab === null ? 0 : Math.sign(tab - lastTab);

  useEffect(() => {
    lastTab = tab;
  }, [tab]);

  if (reduce) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0.35, x: dir * 36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
