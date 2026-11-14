"use client";

/*
 * Client store for Pocket Rocket.
 *
 * Shaped so a Convex backend can replace it later: every read is a pure selector over
 * PocketState (see selectors.ts, each one a future Convex query) and every write is one
 * named action below (each one a future Convex mutation). Until then state is seeded from
 * fixtures and persisted to localStorage.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { makeFixtures } from "./fixtures";
import { balanceOf, jobsForKid } from "./selectors";
import { sound } from "./sound";
import type { Goal, Job, Kid, PocketState } from "./types";

export const STORAGE_KEY = "pocket-rocket:v1";
const UNLOCK_KEY = "pocket-rocket:unlocked";

export type JobInput = Omit<Job, "id"> & { id?: string };
export type KidInput = Omit<Kid, "id"> & { id?: string };

export interface Actions {
  claimJob(kidId: string, jobId: string): void;
  approveClaim(claimId: string): void;
  declineClaim(claimId: string): void;
  addGift(kidId: string, amountCents: number, note?: string): void;
  spend(kidId: string, amountCents: number, note?: string): void;
  upsertJob(job: JobInput): void;
  archiveJob(jobId: string): void;
  upsertKid(kid: KidInput): void;
  removeKid(kidId: string): void;
  setGoal(kidId: string, goal: Goal | undefined): void;
  setPin(pin: string): void;
  setMuted(muted: boolean): void;
  resetDemo(): void;
}

export type Action =
  | { type: "claimJob"; kidId: string; jobId: string }
  | { type: "approveClaim"; claimId: string }
  | { type: "declineClaim"; claimId: string }
  | { type: "addGift"; kidId: string; amountCents: number; note?: string }
  | { type: "spend"; kidId: string; amountCents: number; note?: string }
  | { type: "upsertJob"; job: JobInput }
  | { type: "archiveJob"; jobId: string }
  | { type: "upsertKid"; kid: KidInput }
  | { type: "removeKid"; kidId: string }
  | { type: "setGoal"; kidId: string; goal: Goal | undefined }
  | { type: "setPin"; pin: string }
  | { type: "setMuted"; muted: boolean }
  | { type: "resetDemo" };

let seq = 0;
function uid(prefix: string, now: number): string {
  seq += 1;
  return `${prefix}-${now.toString(36)}-${seq.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Pure state transitions. `now` is passed in so tests are deterministic. */
export function reduce(state: PocketState, action: Action, now: number): PocketState {
  switch (action.type) {
    case "claimJob": {
      const entry = jobsForKid(state, action.kidId, now).find((e) => e.job.id === action.jobId);
      if (!entry || entry.status !== "todo") return state;
      return {
        ...state,
        claims: [
          ...state.claims,
          { id: uid("claim", now), jobId: action.jobId, kidId: action.kidId, claimedAt: now, status: "waiting" },
        ],
      };
    }
    case "approveClaim": {
      const claim = state.claims.find((c) => c.id === action.claimId);
      if (!claim || claim.status !== "waiting") return state;
      const job = state.jobs.find((j) => j.id === claim.jobId);
      if (!job) return state;
      return {
        ...state,
        claims: state.claims.map((c) => (c.id === claim.id ? { ...c, status: "approved", resolvedAt: now } : c)),
        txns: [
          ...state.txns,
          { id: uid("txn", now), kidId: claim.kidId, type: "job", amountCents: job.valueCents, note: job.name, jobId: job.id, at: now },
        ],
      };
    }
    case "declineClaim": {
      const claim = state.claims.find((c) => c.id === action.claimId);
      if (!claim || claim.status !== "waiting") return state;
      return {
        ...state,
        claims: state.claims.map((c) => (c.id === claim.id ? { ...c, status: "declined", resolvedAt: now } : c)),
      };
    }
    case "addGift": {
      const amount = Math.round(action.amountCents);
      if (!(amount > 0) || !state.kids.some((k) => k.id === action.kidId)) return state;
      return {
        ...state,
        txns: [...state.txns, { id: uid("txn", now), kidId: action.kidId, type: "gift", amountCents: amount, note: action.note || undefined, at: now }],
      };
    }
    case "spend": {
      if (!state.kids.some((k) => k.id === action.kidId)) return state;
      // Balances never go below zero: clamp to what the child has.
      const amount = Math.min(Math.round(action.amountCents), Math.max(0, balanceOf(state, action.kidId)));
      if (!(amount > 0)) return state;
      return {
        ...state,
        txns: [...state.txns, { id: uid("txn", now), kidId: action.kidId, type: "spend", amountCents: -amount, note: action.note || undefined, at: now }],
      };
    }
    case "upsertJob": {
      const { id, ...rest } = action.job;
      if (id && state.jobs.some((j) => j.id === id)) {
        return { ...state, jobs: state.jobs.map((j) => (j.id === id ? { ...rest, id } : j)) };
      }
      return { ...state, jobs: [...state.jobs, { ...rest, id: id ?? uid("job", now) }] };
    }
    case "archiveJob":
      return { ...state, jobs: state.jobs.map((j) => (j.id === action.jobId ? { ...j, archived: true } : j)) };
    case "upsertKid": {
      const { id, ...rest } = action.kid;
      if (id && state.kids.some((k) => k.id === id)) {
        return { ...state, kids: state.kids.map((k) => (k.id === id ? { ...rest, id } : k)) };
      }
      return { ...state, kids: [...state.kids, { ...rest, id: id ?? uid("kid", now) }] };
    }
    case "removeKid":
      return {
        ...state,
        kids: state.kids.filter((k) => k.id !== action.kidId),
        claims: state.claims.filter((c) => c.kidId !== action.kidId),
        txns: state.txns.filter((t) => t.kidId !== action.kidId),
        jobs: state.jobs.map((j) => (j.kidIds.includes(action.kidId) ? { ...j, kidIds: j.kidIds.filter((k) => k !== action.kidId) } : j)),
      };
    case "setGoal":
      return { ...state, kids: state.kids.map((k) => (k.id === action.kidId ? { ...k, goal: action.goal } : k)) };
    case "setPin":
      return { ...state, settings: { ...state.settings, pin: action.pin } };
    case "setMuted":
      return { ...state, settings: { ...state.settings, muted: action.muted } };
    case "resetDemo":
      return makeFixtures(now);
  }
}

/** Shown (never) before the stored data has loaded; pages should gate on `ready`. */
const EMPTY_STATE: PocketState = { kids: [], jobs: [], claims: [], txns: [], settings: { pin: "", muted: false } };

function looksValid(v: unknown): v is PocketState {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    Array.isArray(s.kids) && Array.isArray(s.jobs) && Array.isArray(s.claims) && Array.isArray(s.txns) &&
    !!s.settings && typeof (s.settings as Record<string, unknown>).pin === "string"
  );
}

function load(): PocketState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (looksValid(parsed)) return parsed;
    }
  } catch {
    /* fall through to fixtures */
  }
  return makeFixtures(Date.now());
}

interface Ctx {
  state: PocketState;
  ready: boolean;
  actions: Actions;
}

const PocketContext = createContext<Ctx | null>(null);

export function PocketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PocketState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: keep running in memory */
    }
  }, [state, ready]);

  useEffect(() => {
    sound.setMuted(state.settings.muted);
  }, [state.settings.muted]);

  const dispatch = useCallback((a: Action) => setState((s) => reduce(s, a, Date.now())), []);

  const actions = useMemo<Actions>(
    () => ({
      claimJob: (kidId, jobId) => dispatch({ type: "claimJob", kidId, jobId }),
      approveClaim: (claimId) => dispatch({ type: "approveClaim", claimId }),
      declineClaim: (claimId) => dispatch({ type: "declineClaim", claimId }),
      addGift: (kidId, amountCents, note) => dispatch({ type: "addGift", kidId, amountCents, note }),
      spend: (kidId, amountCents, note) => dispatch({ type: "spend", kidId, amountCents, note }),
      upsertJob: (job) => dispatch({ type: "upsertJob", job }),
      archiveJob: (jobId) => dispatch({ type: "archiveJob", jobId }),
      upsertKid: (kid) => dispatch({ type: "upsertKid", kid }),
      removeKid: (kidId) => dispatch({ type: "removeKid", kidId }),
      setGoal: (kidId, goal) => dispatch({ type: "setGoal", kidId, goal }),
      setPin: (pin) => dispatch({ type: "setPin", pin }),
      setMuted: (muted) => dispatch({ type: "setMuted", muted }),
      resetDemo: () => dispatch({ type: "resetDemo" }),
    }),
    [dispatch],
  );

  const value = useMemo(() => ({ state, ready, actions }), [state, ready, actions]);
  return <PocketContext.Provider value={value}>{children}</PocketContext.Provider>;
}

export function usePocket(): Ctx {
  const ctx = useContext(PocketContext);
  if (!ctx) throw new Error("usePocket must be used inside <PocketProvider>");
  return ctx;
}

/* ---------- parent lock (sessionStorage) ---------- */

const lockListeners = new Set<() => void>();

function readUnlocked(): boolean {
  try {
    return window.sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeLock(cb: () => void): () => void {
  lockListeners.add(cb);
  return () => lockListeners.delete(cb);
}

function writeUnlocked(v: boolean) {
  try {
    if (v) window.sessionStorage.setItem(UNLOCK_KEY, "1");
    else window.sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* ignore */
  }
  lockListeners.forEach((l) => l());
}

export function useParentLock(): { unlocked: boolean; unlock(pin: string): boolean; lock(): void } {
  const { state } = usePocket();
  const unlocked = useSyncExternalStore(subscribeLock, readUnlocked, () => false);
  const pin = state.settings.pin;
  const unlock = useCallback(
    (attempt: string) => {
      const ok = pin !== "" && attempt === pin;
      if (ok) writeUnlocked(true);
      return ok;
    },
    [pin],
  );
  const lock = useCallback(() => writeUnlocked(false), []);
  return { unlocked, unlock, lock };
}
