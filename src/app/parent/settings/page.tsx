"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/art/Icon";
import ui from "@/components/parent/ui.module.css";
import { Button } from "@/components/ui/Button";
import { sound } from "@/lib/sound";
import { useParentLock, usePocket } from "@/lib/store";
import styles from "./page.module.css";

export default function SettingsPage() {
  const { state, actions } = usePocket();
  const { lock } = useParentLock();
  const router = useRouter();
  const id = useId();

  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [pinMsg, setPinMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [didReset, setDidReset] = useState(false);

  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 4);

  const changePin = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin1)) {
      setPinMsg({ kind: "bad", text: "A PIN is exactly 4 digits. Use numbers only." });
      return;
    }
    if (pin1 !== pin2) {
      setPinMsg({ kind: "bad", text: "The two PINs don't match. Type the same 4 digits in both boxes." });
      return;
    }
    actions.setPin(pin1);
    setPin1("");
    setPin2("");
    setPinMsg({ kind: "ok", text: "PIN changed. Use the new PIN next time you unlock." });
  };

  return (
    <div className={ui.page}>
      <h1 className={ui.h1}>Settings</h1>

      <section className={ui.section} aria-labelledby="pin-h">
        <h2 className={ui.h2} id="pin-h">
          Change PIN
        </h2>
        <form className={ui.form} onSubmit={changePin} noValidate>
          <div className={styles.pins}>
            <div className={ui.field}>
              <label className={ui.label} htmlFor={`${id}-p1`}>
                New PIN
              </label>
              <input
                id={`${id}-p1`}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                maxLength={4}
                value={pin1}
                onChange={(e) => {
                  setPin1(digits(e.target.value));
                  setPinMsg(null);
                }}
                aria-invalid={pinMsg?.kind === "bad" ? true : undefined}
                aria-describedby={pinMsg ? `${id}-pin-msg` : undefined}
              />
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor={`${id}-p2`}>
                New PIN again
              </label>
              <input
                id={`${id}-p2`}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                maxLength={4}
                value={pin2}
                onChange={(e) => {
                  setPin2(digits(e.target.value));
                  setPinMsg(null);
                }}
                aria-invalid={pinMsg?.kind === "bad" ? true : undefined}
                aria-describedby={pinMsg ? `${id}-pin-msg` : undefined}
              />
            </div>
          </div>
          <div aria-live="polite" id={`${id}-pin-msg`}>
            {pinMsg && <p className={pinMsg.kind === "ok" ? ui.note : ui.error}>{pinMsg.text}</p>}
          </div>
          <div className={ui.stack}>
            <Button type="submit" variant="ok">
              Change PIN
            </Button>
          </div>
        </form>
      </section>

      <section className={ui.section} aria-labelledby="sound-h">
        <h2 className={ui.h2} id="sound-h">
          Sound
        </h2>
        <div className={ui.switchRow}>
          <label htmlFor={`${id}-sound`} className={ui.label}>
            Sound effects are {state.settings.muted ? "off" : "on"}
          </label>
          <span className={ui.switch}>
            <input
              id={`${id}-sound`}
              type="checkbox"
              role="switch"
              checked={!state.settings.muted}
              onChange={(e) => {
                const on = e.target.checked;
                actions.setMuted(!on);
                if (on) {
                  sound.setMuted(false);
                  sound.pop();
                }
              }}
            />
            <span className={ui.track} aria-hidden="true" />
          </span>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="reset-h">
        <h2 className={ui.h2} id="reset-h">
          Demo data
        </h2>
        {confirmReset ? (
          <div className={ui.confirm} role="group" aria-label="Confirm reset">
            <p>
              Reset everything? Kids, jobs, balances and history go back to the demo family, and the PIN goes back to 1234.
            </p>
            <div className={ui.btnRow}>
              <Button
                variant="danger"
                onClick={() => {
                  actions.resetDemo();
                  setConfirmReset(false);
                  setDidReset(true);
                }}
              >
                Reset everything
              </Button>
              <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className={ui.stack}>
            <p className={ui.muted}>Puts the demo family back as it was at the start.</p>
            <Button
              onClick={() => {
                setDidReset(false);
                setConfirmReset(true);
              }}
              style={{ justifySelf: "start" }}
            >
              Reset demo data
            </Button>
          </div>
        )}
        <div aria-live="polite">{didReset && <p className={ui.note}>Demo data restored.</p>}</div>
      </section>

      <section className={ui.section} aria-labelledby="lock-h">
        <h2 className={ui.h2} id="lock-h">
          Lock
        </h2>
        <div className={ui.stack}>
          <p className={ui.muted}>Locks the parent area and goes back to who&apos;s playing.</p>
          <Button
            onClick={() => {
              lock();
              router.push("/");
            }}
            style={{ justifySelf: "start" }}
          >
            <Icon name="lock" size={20} />
            Lock
          </Button>
        </div>
      </section>
    </div>
  );
}
