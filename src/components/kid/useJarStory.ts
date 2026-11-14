"use client";

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";
import type { Goal } from "@/lib/types";
import { coinsFor } from "./jarMath";

/*
 * The signature moment. We remember the balance this child last saw. When the screen opens (or the
 * balance changes) and it differs, we replay the difference: coins drop in and the number counts up,
 * or coins lift out and the number counts down. Under reduced motion we just show the new state.
 */

const MAX_COINS = 10;
const STAGGER = 260; // ms between falling coins
const LANDS_AFTER = 460; // ms from a coin's start to first touching the pile
const EXIT_STAGGER = 190;

interface Story {
  id: number;
  dir: "up" | "down";
  from: number;
  to: number;
}

interface JarState {
  /** the number on screen */
  shown: number;
  /** the balance the pile is drawn for */
  pileCents: number;
  story: Story | null;
  /** coins with index >= from fall in; `id` re-keys them so they replay */
  drop: { id: number; from: number };
  celebrate: number;
}

const seenKey = (kidId: string) => `pocket-rocket:seen:${kidId}`;

function readSeen(kidId: string): number | null {
  try {
    const raw = window.localStorage.getItem(seenKey(kidId));
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeSeen(kidId: string, cents: number) {
  try {
    window.localStorage.setItem(seenKey(kidId), String(cents));
  } catch {
    /* fine: the jar just won't replay next time */
  }
}

function prefersReduced(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

const crosses = (goal: Goal | undefined, from: number, to: number) =>
  !!goal && goal.priceCents > 0 && from < goal.priceCents && to >= goal.priceCents;

export function useJarStory(kidId: string, cents: number, goal?: Goal) {
  const seenAtOpen = useRef<{ seen: number | null } | null>(null);
  if (seenAtOpen.current === null) seenAtOpen.current = { seen: readSeen(kidId) };

  const [s, setS] = useState<JarState>(() => {
    const seen = seenAtOpen.current?.seen ?? null;
    const replay = seen !== null && seen !== cents && !prefersReduced();
    const start = replay ? (seen as number) : cents;
    return {
      shown: start,
      pileCents: start,
      story: replay ? { id: 1, dir: cents > start ? "up" : "down", from: start, to: cents } : null,
      drop: { id: 0, from: 9999 },
      celebrate: 0,
    };
  });

  const handled = useRef(cents);
  const first = useRef(true);
  const goalRef = useRef(goal);
  goalRef.current = goal;

  // Notice balance changes while the screen is open, and record what has now been seen.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      const seen = seenAtOpen.current?.seen ?? null;
      if (seen !== null && seen !== cents && prefersReduced() && crosses(goalRef.current, seen, cents)) {
        sound.cheer();
        setS((p) => ({ ...p, celebrate: p.celebrate + 1 }));
      }
      writeSeen(kidId, cents);
      return;
    }
    if (cents === handled.current) return;
    const from = handled.current;
    handled.current = cents;
    writeSeen(kidId, cents);
    if (prefersReduced()) {
      if (crosses(goalRef.current, from, cents)) sound.cheer();
      setS((p) => ({ ...p, shown: cents, pileCents: cents, story: null, celebrate: crosses(goalRef.current, from, cents) ? p.celebrate + 1 : p.celebrate }));
      return;
    }
    setS((p) => ({ ...p, story: { id: (p.story?.id ?? p.drop.id) + 1, dir: cents > from ? "up" : "down", from, to: cents } }));
  }, [cents, kidId]);

  const storyId = s.story?.id;
  useEffect(() => {
    const story = s.story;
    if (!story) return;
    const g = goalRef.current;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const lerp = (k: number, n: number) => Math.round(story.from + ((story.to - story.from) * (k + 1)) / n);
    const oldCoins = coinsFor(story.from, g);
    const newCoins = coinsFor(story.to, g);
    let end: number;

    if (story.dir === "up") {
      const n = Math.min(MAX_COINS, Math.max(1, newCoins - oldCoins));
      const from = Math.max(0, newCoins - n);
      at(120, () => setS((p) => ({ ...p, pileCents: story.to, drop: { id: story.id, from } })));
      for (let k = 0; k < n; k++) {
        at(120 + k * STAGGER + LANDS_AFTER, () => {
          sound.coin();
          setS((p) => ({ ...p, shown: lerp(k, n) }));
        });
      }
      end = 120 + (n - 1) * STAGGER + LANDS_AFTER + 600;
    } else {
      const n = Math.min(MAX_COINS, Math.max(1, oldCoins - newCoins));
      for (let k = 0; k < n; k++) {
        at(250 + k * EXIT_STAGGER, () => setS((p) => ({ ...p, shown: lerp(k, n), pileCents: lerp(k, n) })));
      }
      end = 250 + n * EXIT_STAGGER + 400;
    }

    at(end, () => {
      const won = crosses(g, story.from, story.to);
      if (won) sound.cheer();
      setS((p) => ({ ...p, shown: story.to, pileCents: story.to, story: null, celebrate: won ? p.celebrate + 1 : p.celebrate }));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
    // The story id is the trigger; the story object itself is read from the render that started it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  return {
    shown: s.shown,
    pileCoins: coinsFor(s.pileCents, goal),
    drop: s.drop,
    stagger: STAGGER / 1000,
    celebrate: s.celebrate,
    replaying: s.story !== null,
  };
}
