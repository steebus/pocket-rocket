"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { GOAL_ICONS, GoalIcon } from "@/components/art/GoalIcon";
import { Icon } from "@/components/art/Icon";
import { MASCOT_IDS, Mascot } from "@/components/art/Mascot";
import { Button } from "@/components/ui/Button";
import { KID_COLORS } from "@/lib/kidColors";
import { formatCents, parseDollars } from "@/lib/money";
import { usePocket } from "@/lib/store";
import type { Goal, GoalIconId, Kid, KidColorId, MascotId } from "@/lib/types";
import { centsToInput } from "./labels";
import styles from "./KidForm.module.css";
import ui from "./ui.module.css";

const COLOR_IDS = Object.keys(KID_COLORS) as KidColorId[];
const MAX_NAME = 16;
const MAX_PRICE = 100_000;

/** Shared by "new kid" and "edit kid". Calls `onSaved` after the kid is stored. */
export function KidForm({
  kid,
  submitLabel,
  onSaved,
  after,
}: {
  kid?: Kid;
  submitLabel: string;
  onSaved: () => void;
  /** Rendered under the save button (the edit page puts its status line here). */
  after?: ReactNode;
}) {
  const { state, actions } = usePocket();
  const id = useId();
  const form = useRef<HTMLFormElement>(null);

  const unusedColor = COLOR_IDS.find((c) => !state.kids.some((k) => k.color === c)) ?? COLOR_IDS[0];
  const [name, setName] = useState(kid?.name ?? "");
  const [mascot, setMascot] = useState<MascotId>(kid?.mascot ?? "blob");
  const [color, setColor] = useState<KidColorId>(kid?.color ?? unusedColor);
  const [hasGoal, setHasGoal] = useState(!!kid?.goal);
  const [goalName, setGoalName] = useState(kid?.goal?.name ?? "");
  const [goalIcon, setGoalIcon] = useState<GoalIconId | null>(kid?.goal?.icon ?? null);
  const [price, setPrice] = useState(kid?.goal ? centsToInput(kid.goal.priceCents) : "");
  const [tried, setTried] = useState(false);

  const priceCents = parseDollars(price);
  const errors: { name?: string; goalName?: string; goalIcon?: string; price?: string } = {};
  if (!name.trim()) errors.name = "Add a name so everyone knows whose jar this is.";
  if (hasGoal) {
    if (!goalName.trim()) errors.goalName = "Name the goal, like Scooter.";
    if (!goalIcon) errors.goalIcon = "Pick a picture for the goal.";
    if (price.trim() === "" || priceCents === null) errors.price = "Enter the price like 40 or 12.50.";
    else if (priceCents <= 0) errors.price = "The price needs to be more than $0.";
    else if (priceCents > MAX_PRICE) errors.price = `The most you can enter is ${formatCents(MAX_PRICE)}.`;
  }
  const invalid = Object.keys(errors).length > 0;
  const show = (k: keyof typeof errors) => (tried ? errors[k] : undefined);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (invalid) {
      setTried(true);
      requestAnimationFrame(() => {
        form.current?.querySelector<HTMLElement>("[data-invalid] input")?.focus();
      });
      return;
    }
    let goal: Goal | undefined;
    if (hasGoal && goalIcon && priceCents !== null) goal = { name: goalName.trim(), icon: goalIcon, priceCents };
    const input = { id: kid?.id, name: name.trim(), mascot, color, goal };
    actions.upsertKid(input);
    onSaved();
  };

  return (
    <form className={ui.form} onSubmit={submit} noValidate ref={form}>
      <div className={ui.field} data-invalid={show("name") ? "" : undefined}>
        <label className={ui.label} htmlFor={`${id}-name`}>
          Name
        </label>
        <input
          id={`${id}-name`}
          value={name}
          maxLength={MAX_NAME}
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
          aria-invalid={show("name") ? true : undefined}
          aria-describedby={show("name") ? `${id}-name-err` : undefined}
        />
        {show("name") && (
          <p className={ui.error} id={`${id}-name-err`} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <fieldset className={ui.group}>
        <legend className={ui.legend}>Character</legend>
        <div className={[ui.tiles, ui.tiles3].join(" ")}>
          {MASCOT_IDS.map((m) => (
            <label key={m} className={ui.tile}>
              <input type="radio" name={`${id}-mascot`} checked={mascot === m} onChange={() => setMascot(m)} />
              <span className={ui.tileBody} style={{ minHeight: 84 }}>
                <Mascot id={m} color={color} size={56} />
                <span style={{ textTransform: "capitalize" }}>{m}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={ui.group}>
        <legend className={ui.legend}>Colour</legend>
        <div className={ui.swatches}>
          {COLOR_IDS.map((c) => (
            <label key={c} className={ui.swatch} title={KID_COLORS[c].label}>
              <input
                type="radio"
                name={`${id}-color`}
                aria-label={KID_COLORS[c].label}
                checked={color === c}
                onChange={() => setColor(c)}
              />
              <span className={ui.swatchBody} style={{ background: KID_COLORS[c].main }}>
                <Icon name="check" size={24} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={ui.group}>
        <legend className={ui.legend}>Savings goal</legend>
        {!hasGoal ? (
          <>
            <p className={ui.hint}>A goal shows {name.trim() || "your child"} how close they are to something they want.</p>
            <div className={ui.stack}>
              <Button className={styles.addGoal} onClick={() => setHasGoal(true)}>
                <Icon name="target" size={20} />
                Add a savings goal
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.goalBox}>
            <div className={ui.field} data-invalid={show("goalName") ? "" : undefined}>
              <label className={ui.label} htmlFor={`${id}-goal`}>
                Goal name
              </label>
              <input
                id={`${id}-goal`}
                value={goalName}
                maxLength={24}
                autoComplete="off"
                placeholder="Scooter"
                onChange={(e) => setGoalName(e.target.value)}
                aria-invalid={show("goalName") ? true : undefined}
                aria-describedby={show("goalName") ? `${id}-goal-err` : undefined}
              />
              {show("goalName") && (
                <p className={ui.error} id={`${id}-goal-err`} role="alert">
                  {errors.goalName}
                </p>
              )}
            </div>

            <fieldset className={ui.group} data-invalid={show("goalIcon") ? "" : undefined}>
              <legend className={ui.legend}>Goal picture</legend>
              <div className={ui.tiles}>
                {GOAL_ICONS.map((g) => (
                  <label key={g.id} className={ui.tile}>
                    <input
                      type="radio"
                      name={`${id}-goalicon`}
                      checked={goalIcon === g.id}
                      onChange={() => setGoalIcon(g.id)}
                    />
                    <span className={ui.tileBody}>
                      <GoalIcon id={g.id} size={40} />
                      {g.label}
                    </span>
                  </label>
                ))}
              </div>
              {show("goalIcon") && (
                <p className={ui.error} role="alert">
                  {errors.goalIcon}
                </p>
              )}
            </fieldset>

            <div className={ui.field} data-invalid={show("price") ? "" : undefined}>
              <label className={ui.label} htmlFor={`${id}-price`}>
                Price in dollars
              </label>
              <div className={ui.dollar}>
                <span aria-hidden="true">$</span>
                <input
                  id={`${id}-price`}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="40"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  aria-invalid={show("price") ? true : undefined}
                  aria-describedby={show("price") ? `${id}-price-err` : undefined}
                />
              </div>
              {show("price") && (
                <p className={ui.error} id={`${id}-price-err`} role="alert">
                  {errors.price}
                </p>
              )}
            </div>

            <button type="button" className={[ui.linkBtn, styles.addGoal].join(" ")} onClick={() => setHasGoal(false)}>
              <Icon name="trash" size={18} />
              Remove goal
            </button>
          </div>
        )}
      </fieldset>

      <div className={ui.stack}>
        <Button type="submit" variant="ok" size="lg">
          {submitLabel}
        </Button>
        {after}
      </div>
    </form>
  );
}
