"use client";

import { useId, useState, type FormEvent } from "react";
import { Mascot } from "@/components/art/Mascot";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { formatCents, parseDollars } from "@/lib/money";
import { balanceOf } from "@/lib/selectors";
import { sound } from "@/lib/sound";
import { usePocket } from "@/lib/store";
import type { Kid } from "@/lib/types";
import styles from "./MoneySheet.module.css";
import ui from "./ui.module.css";

export type MoneyMode = "gift" | "spend";

const QUICK = [100, 200, 500, 1000];
const MAX_CENTS = 100_000;

/** Gift or spend for one kid. The sheet content mounts fresh each time it opens, so fields start empty. */
export function MoneySheet({
  kidId,
  mode,
  open,
  onClose,
}: {
  kidId: string;
  mode: MoneyMode;
  open: boolean;
  onClose: () => void;
}) {
  const { state } = usePocket();
  const kid = state.kids.find((k) => k.id === kidId);
  if (!kid) return null;
  return (
    <Sheet open={open} onClose={onClose} title={mode === "gift" ? "Add a gift" : "Take off a spend"}>
      <MoneyForm kid={kid} mode={mode} onDone={onClose} />
    </Sheet>
  );
}

function MoneyForm({ kid, mode, onDone }: { kid: Kid; mode: MoneyMode; onDone: () => void }) {
  const { state, actions } = usePocket();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const id = useId();
  const balance = balanceOf(state, kid.id);

  const cents = parseDollars(amount);
  const typed = amount.trim() !== "";
  let problem: string | null = null;
  if (typed) {
    if (cents === null) problem = "Enter an amount like 5 or 2.50.";
    else if (cents <= 0) problem = "Enter an amount more than $0.";
    else if (cents > MAX_CENTS) problem = `The most you can enter is ${formatCents(MAX_CENTS)}.`;
    else if (mode === "spend" && cents > balance) problem = `${kid.name} only has ${formatCents(balance)}.`;
  }
  const valid = typed && problem === null && cents !== null;

  const label = valid
    ? mode === "gift"
      ? `Give ${kid.name} ${formatCents(cents)}`
      : `Take ${formatCents(cents)} from ${kid.name}`
    : mode === "gift"
      ? `Give ${kid.name} a gift`
      : `Take money from ${kid.name}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || cents === null) return;
    const text = note.trim() || undefined;
    if (mode === "gift") {
      sound.coin();
      actions.addGift(kid.id, cents, text);
    } else {
      sound.pop();
      actions.spend(kid.id, cents, text);
    }
    onDone();
  };

  return (
    <>
      <div className={styles.who}>
        <Mascot id={kid.mascot} color={kid.color} size={48} />
        <div>
          <strong>{kid.name}</strong>
          <span>
            Has <b data-money>{formatCents(balance)}</b>
          </span>
        </div>
      </div>

      <form className={ui.form} onSubmit={submit} noValidate>
        <fieldset className={ui.group}>
          <legend className={ui.legend}>Quick amount</legend>
          <div className={ui.seg}>
            {QUICK.map((q) => (
              <label key={q}>
                <input
                  type="radio"
                  name={`${id}-quick`}
                  checked={cents === q}
                  onChange={() => setAmount(String(q / 100))}
                />
                <span>{formatCents(q).replace(".00", "")}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={ui.field}>
          <label className={ui.label} htmlFor={`${id}-amount`}>
            Amount in dollars
          </label>
          <div className={ui.dollar}>
            <span aria-hidden="true">$</span>
            <input
              id={`${id}-amount`}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={problem ? true : undefined}
              aria-describedby={problem ? `${id}-err` : undefined}
            />
          </div>
          {problem && (
            <p className={ui.error} id={`${id}-err`} role="alert">
              {problem}
            </p>
          )}
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor={`${id}-note`}>
            Note (optional)
          </label>
          <input
            id={`${id}-note`}
            maxLength={60}
            autoComplete="off"
            placeholder={mode === "gift" ? "Birthday money from Nan" : "Lego at the shops"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className={ui.stack}>
          <Button type="submit" variant={mode === "gift" ? "ok" : "plain"} size="lg" disabled={!valid}>
            {label}
          </Button>
        </div>
      </form>
    </>
  );
}
