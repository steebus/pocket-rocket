"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/art/Icon";
import { Button } from "@/components/ui/Button";
import { sound } from "@/lib/sound";
import { useParentLock, usePocket } from "@/lib/store";
import styles from "./PinGate.module.css";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PinGate() {
  const { state } = usePocket();
  const { unlock } = useParentLock();
  const [digits, setDigits] = useState("");
  const [wrong, setWrong] = useState(false);
  const value = useRef("");
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const add = useCallback(
    (d: string) => {
      if (busy.current || value.current.length >= 4) return;
      const next = value.current + d;
      value.current = next;
      setDigits(next);
      setWrong(false);
      if (next.length < 4) return;
      if (unlock(next)) return; // the layout swaps to the parent area
      busy.current = true;
      sound.nope();
      setWrong(true);
      timer.current = setTimeout(() => {
        value.current = "";
        setDigits("");
        busy.current = false;
      }, 380);
    },
    [unlock],
  );

  const back = useCallback(() => {
    if (busy.current || value.current.length === 0) return;
    value.current = value.current.slice(0, -1);
    setDigits(value.current);
    setWrong(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        add(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [add, back]);

  return (
    <main className={styles.screen}>
      <title>Pocket Rocket: Parents only</title>
      <div className={styles.lock}>
        <Icon name="lock" size={38} />
      </div>
      <h1 className={styles.title}>Parents only</h1>

      <div
        className={[styles.dots, wrong ? styles.shake : ""].join(" ")}
        role="img"
        aria-label={`${digits.length} of 4 digits entered`}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={[styles.dot, i < digits.length ? styles.on : ""].join(" ")} />
        ))}
      </div>

      <div className={styles.msg} role="status" aria-live="polite">
        {wrong ? (
          <span className={styles.bad}>That PIN isn&apos;t right. Try again.</span>
        ) : (
          <span>Enter your 4 digit PIN.</span>
        )}
      </div>

      <div className={styles.pad}>
        {KEYS.map((k) => (
          <Button key={k} className={styles.key} onClick={() => add(k)} aria-label={k}>
            {k}
          </Button>
        ))}
        <span className={styles.gap} aria-hidden="true" />
        <Button className={styles.key} onClick={() => add("0")} aria-label="0">
          0
        </Button>
        <Button className={styles.key} onClick={back} aria-label="Delete last digit">
          <Icon name="back" size={28} />
        </Button>
      </div>

      {state.settings.pin === "1234" && <p className={styles.demo}>Demo PIN: 1234</p>}

      <Link href="/" className={styles.back}>
        <Icon name="back" size={18} />
        Back to who&apos;s playing
      </Link>
    </main>
  );
}
