"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/art/Icon";
import { JOB_ICONS, JobIcon } from "@/components/art/JobIcon";
import { Mascot } from "@/components/art/Mascot";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { formatCents, parseDollars } from "@/lib/money";
import { sound } from "@/lib/sound";
import { usePocket } from "@/lib/store";
import type { Job, JobIconId, Repeat } from "@/lib/types";
import { REPEAT_LABEL, centsToInput } from "./labels";
import styles from "./JobSheet.module.css";
import ui from "./ui.module.css";

const MAX_CENTS = 10_000;
const REPEATS: Repeat[] = ["daily", "weekly", "once"];

/** Add (no `job`) or edit a job. Content mounts fresh on open so the fields always start from the saved job. */
export function JobSheet({ job, open, onClose }: { job?: Job; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={job ? "Edit job" : "Add a job"}>
      <JobForm job={job} onDone={onClose} />
    </Sheet>
  );
}

function JobForm({ job, onDone }: { job?: Job; onDone: () => void }) {
  const { state, actions } = usePocket();
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(job?.name ?? "");
  const [icon, setIcon] = useState<JobIconId | null>(job?.icon ?? null);
  const [value, setValue] = useState(job ? centsToInput(job.valueCents) : "");
  const [repeat, setRepeat] = useState<Repeat>(job?.repeat ?? "daily");
  const [kidIds, setKidIds] = useState<string[]>(job?.kidIds ?? []);
  const [tried, setTried] = useState(false);
  const [removing, setRemoving] = useState(false);

  const cents = parseDollars(value);
  const errors: { name?: string; icon?: string; value?: string; kids?: string } = {};
  if (!name.trim()) errors.name = "Give the job a name, like Make bed.";
  if (!icon) errors.icon = "Pick a picture so little kids can find the job.";
  if (value.trim() === "" || cents === null) errors.value = "Enter a dollar amount like 1 or 0.50.";
  else if (cents <= 0) errors.value = "A job needs to pay more than $0. Try 0.50.";
  else if (cents > MAX_CENTS) errors.value = `A job can pay up to ${formatCents(MAX_CENTS)}. Lower the amount.`;
  if (kidIds.length === 0) errors.kids = "Pick at least one kid who does this job.";
  const invalid = Object.keys(errors).length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (invalid || !icon || cents === null) {
      setTried(true);
      requestAnimationFrame(() => {
        form.current?.querySelector<HTMLElement>("[data-invalid] input")?.focus();
      });
      return;
    }
    sound.pop();
    actions.upsertJob({
      id: job?.id,
      name: name.trim(),
      icon,
      valueCents: cents,
      kidIds: state.kids.filter((k) => kidIds.includes(k.id)).map((k) => k.id),
      repeat,
    });
    onDone();
  };

  const toggleKid = (kidId: string) =>
    setKidIds((cur) => (cur.includes(kidId) ? cur.filter((k) => k !== kidId) : [...cur, kidId]));

  const show = (key: keyof typeof errors) => (tried ? errors[key] : undefined);

  return (
    <form className={ui.form} onSubmit={submit} noValidate ref={form}>
      <div className={ui.field} data-invalid={show("name") ? "" : undefined}>
        <label className={ui.label} htmlFor={`${id}-name`}>
          Job name
        </label>
        <input
          id={`${id}-name`}
          value={name}
          maxLength={24}
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
          aria-invalid={show("name") ? true : undefined}
          aria-describedby={`${id}-name-hint${show("name") ? ` ${id}-name-err` : ""}`}
        />
        <p className={ui.hint} id={`${id}-name-hint`}>
          One or two words work best for little kids.
        </p>
        {show("name") && (
          <p className={ui.error} id={`${id}-name-err`} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <fieldset className={ui.group} data-invalid={show("icon") ? "" : undefined}>
        <legend className={ui.legend}>Picture</legend>
        <div className={ui.tiles}>
          {JOB_ICONS.map((j) => (
            <label key={j.id} className={ui.tile}>
              <input
                type="radio"
                name={`${id}-icon`}
                checked={icon === j.id}
                onChange={() => setIcon(j.id)}
              />
              <span className={ui.tileBody}>
                <JobIcon id={j.id} size={40} />
                {j.label}
              </span>
            </label>
          ))}
        </div>
        {show("icon") && (
          <p className={ui.error} role="alert">
            {errors.icon}
          </p>
        )}
      </fieldset>

      <div className={ui.field} data-invalid={show("value") ? "" : undefined}>
        <label className={ui.label} htmlFor={`${id}-value`}>
          Value in dollars
        </label>
        <div className={ui.dollar}>
          <span aria-hidden="true">$</span>
          <input
            id={`${id}-value`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.50"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={show("value") ? true : undefined}
            aria-describedby={show("value") ? `${id}-value-err` : undefined}
          />
        </div>
        {show("value") && (
          <p className={ui.error} id={`${id}-value-err`} role="alert">
            {errors.value}
          </p>
        )}
      </div>

      <fieldset className={ui.group}>
        <legend className={ui.legend}>Repeat</legend>
        <div className={ui.seg}>
          {REPEATS.map((r) => (
            <label key={r}>
              <input type="radio" name={`${id}-repeat`} checked={repeat === r} onChange={() => setRepeat(r)} />
              <span>{REPEAT_LABEL[r]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={ui.group} data-invalid={show("kids") ? "" : undefined}>
        <legend className={ui.legend}>Who does this job?</legend>
        {state.kids.length === 0 ? (
          <p className={styles.none}>
            There are no kids yet. <Link href="/parent/kids/new">Add a kid</Link> first.
          </p>
        ) : (
          <div className={ui.chips}>
            {state.kids.map((k) => (
              <label key={k.id} className={ui.chip}>
                <input type="checkbox" checked={kidIds.includes(k.id)} onChange={() => toggleKid(k.id)} />
                <span className={ui.chipBody}>
                  <Mascot id={k.mascot} color={k.color} size={32} />
                  <span>{k.name}</span>
                  <span className={ui.chipTick}>
                    <Icon name="check" size={18} />
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        {show("kids") && (
          <p className={ui.error} role="alert">
            {errors.kids}
          </p>
        )}
      </fieldset>

      {removing && job ? (
        <div className={ui.confirm} role="group" aria-label="Confirm removing this job">
          <p>
            Remove {job.name}? Kids will stop seeing it. Money already earned stays in their history.
          </p>
          <div className={ui.btnRow}>
            <Button
              variant="danger"
              onClick={() => {
                actions.archiveJob(job.id);
                onDone();
              }}
            >
              Remove job
            </Button>
            <Button onClick={() => setRemoving(false)}>Keep job</Button>
          </div>
        </div>
      ) : (
        <div className={ui.stack}>
          <Button type="submit" variant="ok" size="lg">
            {job ? "Save job" : "Add job"}
          </Button>
          {job && (
            <button type="button" className={ui.linkBtn} onClick={() => setRemoving(true)}>
              <Icon name="trash" size={18} />
              Remove job
            </button>
          )}
        </div>
      )}
    </form>
  );
}
