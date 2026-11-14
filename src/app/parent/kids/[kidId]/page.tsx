"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/art/Icon";
import { JobIcon } from "@/components/art/JobIcon";
import { Mascot } from "@/components/art/Mascot";
import { KidForm } from "@/components/parent/KidForm";
import { signed } from "@/components/parent/labels";
import { PrinterIcon } from "@/components/parent/print/PrintIcons";
import { MoneySheet, type MoneyMode } from "@/components/parent/MoneySheet";
import ui from "@/components/parent/ui.module.css";
import { BalanceNumber } from "@/components/ui/BalanceNumber";
import { Button } from "@/components/ui/Button";
import { KID_COLORS } from "@/lib/kidColors";
import { balanceOf, historyOf } from "@/lib/selectors";
import { usePocket } from "@/lib/store";
import type { Txn } from "@/lib/types";
import styles from "./page.module.css";

const FIRST_PAGE = 15;

export default function KidPage() {
  const { kidId } = useParams<{ kidId: string }>();
  const { state, actions } = usePocket();
  const router = useRouter();
  const [sheet, setSheet] = useState<{ mode: MoneyMode; open: boolean } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [all, setAll] = useState(false);

  const kid = state.kids.find((k) => k.id === kidId);
  if (!kid) {
    return (
      <div className={ui.page}>
        <Link href="/parent" className={ui.backLink}>
          <Icon name="back" size={18} />
          All kids
        </Link>
        <p className={ui.empty}>That kid isn&apos;t here any more. Go back to the list to pick someone else.</p>
      </div>
    );
  }

  const history = historyOf(state, kid.id);
  const shown = all ? history : history.slice(0, FIRST_PAGE);
  const theme = KID_COLORS[kid.color];

  const describe = (t: Txn): { title: string; sub?: string; pic: ReactNode } => {
    if (t.type === "job") {
      const job = state.jobs.find((j) => j.id === t.jobId);
      return {
        title: job?.name ?? t.note ?? "Job",
        sub: "Job approved",
        pic: job ? <JobIcon id={job.icon} size={36} /> : <Icon name="coin" size={30} />,
      };
    }
    if (t.type === "interest") return { title: "Interest", sub: t.note, pic: <Icon name="sprout" size={30} strokeWidth={3} /> };
    if (t.type === "gift") return { title: "Gift", sub: t.note, pic: <Icon name="gift" size={30} /> };
    return { title: "Spent", sub: t.note, pic: <Icon name="cart" size={30} /> };
  };

  return (
    <div className={ui.page} style={{ ["--kid" as string]: theme.main, ["--kid-ground" as string]: theme.ground }}>
      <Link href="/parent" className={ui.backLink}>
        <Icon name="back" size={18} />
        All kids
      </Link>

      <section className={styles.summary} aria-label={`${kid.name}'s balance`}>
        <div className={styles.who}>
          <Mascot id={kid.mascot} color={kid.color} size={64} />
          <div className={ui.grow}>
            <h1 className={ui.h1}>{kid.name}</h1>
            <BalanceNumber cents={balanceOf(state, kid.id)} className={styles.bal} />
          </div>
        </div>
        <div className={styles.acts}>
          <button type="button" className={ui.smallBtn} onClick={() => setSheet({ mode: "gift", open: true })}>
            <Icon name="plus" size={18} />
            Gift
          </button>
          <button type="button" className={ui.smallBtn} onClick={() => setSheet({ mode: "spend", open: true })}>
            <Icon name="minus" size={18} />
            Spend
          </button>
          <Link href={`/parent/kids/${kid.id}/print`} className={[ui.smallBtn, styles.printLink].join(" ")}>
            <PrinterIcon size={20} />
            Print a chart
          </Link>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="details-h">
        <h2 className={ui.h2} id="details-h">
          Details
        </h2>
        <KidForm
          key={kid.id}
          kid={kid}
          submitLabel="Save changes"
          onSaved={() => setSaved(true)}
          after={
            saved ? (
              <p className={ui.note} role="status">
                Saved.
              </p>
            ) : undefined
          }
        />
      </section>

      <section className={ui.section} aria-labelledby="history-h">
        <h2 className={ui.h2} id="history-h">
          History
          <span className={ui.count}>{history.length}</span>
        </h2>
        {history.length === 0 ? (
          <p className={ui.empty}>Nothing yet. Approved jobs, gifts and spends will be listed here.</p>
        ) : (
          <ul className={ui.list}>
            {shown.map((t) => {
              const d = describe(t);
              return (
                <li key={t.id} className={[ui.row, styles.hRow2].join(" ")}>
                  <span className={styles.hPic}>{d.pic}</span>
                  <div className={ui.grow}>
                    <strong className={ui.name}>{d.title}</strong>
                    {d.sub && <span className={ui.sub}>{d.sub}</span>}
                    <span className={styles.date}>
                      {new Date(t.at).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <span className={t.amountCents >= 0 ? styles.plus : styles.minus} data-money>
                    {signed(t.amountCents)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {!all && history.length > FIRST_PAGE && (
          <div className={ui.stack}>
            <Button className={styles.more} onClick={() => setAll(true)}>
              Show all {history.length}
            </Button>
          </div>
        )}
      </section>

      <section className={styles.danger} aria-label={`Remove ${kid.name}`}>
        {removing ? (
          <div className={ui.confirm} role="group" aria-label={`Confirm removing ${kid.name}`}>
            <p>
              Remove {kid.name}? Their balance, claims and history will be deleted. This can&apos;t be undone.
            </p>
            <div className={ui.btnRow}>
              <Button
                variant="danger"
                onClick={() => {
                  router.replace("/parent");
                  actions.removeKid(kid.id);
                }}
              >
                Remove {kid.name}
              </Button>
              <Button onClick={() => setRemoving(false)}>Keep {kid.name}</Button>
            </div>
          </div>
        ) : (
          <button type="button" className={ui.linkBtn} style={{ justifySelf: "start" }} onClick={() => setRemoving(true)}>
            <Icon name="trash" size={18} />
            Remove {kid.name}
          </button>
        )}
      </section>

      {sheet && (
        <MoneySheet
          kidId={kid.id}
          mode={sheet.mode}
          open={sheet.open}
          onClose={() => setSheet((s) => (s ? { ...s, open: false } : s))}
        />
      )}
    </div>
  );
}
