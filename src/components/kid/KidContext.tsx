"use client";

import { createContext, useContext } from "react";
import type { Kid } from "@/lib/types";

const KidContext = createContext<Kid | null>(null);

export const KidProvider = KidContext.Provider;

/** The child whose screens these are. Only valid below the kid layout. */
export function useKid(): Kid {
  const kid = useContext(KidContext);
  if (!kid) throw new Error("useKid must be used inside the kid layout");
  return kid;
}
