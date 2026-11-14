"use client";

import type { ReactNode } from "react";
import { PinGate } from "@/components/parent/PinGate";
import { Shell } from "@/components/parent/Shell";
import { useParentLock, usePocket } from "@/lib/store";

/** The gate: nothing under /parent renders until the PIN is entered for this session. */
export default function ParentLayout({ children }: { children: ReactNode }) {
  const { ready } = usePocket();
  const { unlocked } = useParentLock();

  if (!ready) return <div style={{ minHeight: "100dvh", background: "var(--white)" }} aria-hidden="true" />;
  if (!unlocked) return <PinGate />;
  return <Shell>{children}</Shell>;
}
