"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/art/Icon";
import { CoinSheet, JobsTable, NoJobs, PrintJar, SheetHeader, sortJobs } from "@/components/parent/print/PrintParts";
import { PrinterIcon } from "@/components/parent/print/PrintIcons";
import sheet from "@/components/parent/print/Sheet.module.css";
import ui from "@/components/parent/ui.module.css";
import { KID_COLORS } from "@/lib/kidColors";
import { balanceOf } from "@/lib/selectors";
import { usePocket } from "@/lib/store";
import styles from "./page.module.css";

/**
 * With this many jobs or fewer, the jobs list shares sheet 1 with the jar and coins (verified by
 * printing to PDF: 8 rows of 13mm still leave the jar at 110mm tall and everything on one A4 page).
 * Above it the whole list moves to sheet 2 and the jar goes big.
 */
const ONE_SHEET_MAX_JOBS = 8;

export default function PrintPage() {
  const { kidId } = useParams<{ kidId: string }>();
  const { state, ready } = usePocket();
  const [now, setNow] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const stageRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setNow(Date.now()), []);

  const kid = state.kids.find((k) => k.id === kidId);
  const jobs = kid ? sortJobs(state.jobs.filter((j) => !j.archived && j.kidIds.includes(kid.id))) : [];
  const shown = ready && !!kid && now !== null;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const scaler = scalerRef.current;
    if (!stage || !scaler) return;
    const fit = () => {
      const natural = scaler.offsetWidth;
      const next = natural > 0 ? Math.min(1, stage.clientWidth / natural) : 1;
      setScale(next);
      setHeight(scaler.offsetHeight * next);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    ro.observe(scaler);
    return () => ro.disconnect();
  }, [shown, jobs.length]);

  if (!ready) return null;

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
  if (now === null) return null;

  const theme = KID_COLORS[kid.color];
  const cents = balanceOf(state, kid.id);
  const oneSheet = jobs.length <= ONE_SHEET_MAX_JOBS;

  return (
    <div className={styles.page} style={{ ["--kid" as string]: theme.main, ["--kid-ground" as string]: theme.ground }}>
      <title>{`Pocket Rocket: ${kid.name}'s chart`}</title>
      <div className={styles.toolbar}>
        <div className={styles.bar}>
          <Link href={`/parent/kids/${kid.id}`} className={ui.backLink}>
            <Icon name="back" size={18} />
            {kid.name}
          </Link>
          <button type="button" className={styles.printBtn} onClick={() => window.print()}>
            <PrinterIcon size={24} />
            Print
          </button>
        </div>
        <p className={styles.help}>
          Prints on A4. Cut out the coins and stick them on the jar when you add money, then add it in the app later.
        </p>
      </div>

      <div className={styles.stage} ref={stageRef} style={height ? { height } : undefined}>
        <div className={styles.scaler} ref={scalerRef} style={{ transform: `scale(${scale})` }}>
          {oneSheet ? (
            <section className={sheet.sheet} aria-label="Chart">
              <SheetHeader kid={kid} now={now} />
              <div className={sheet.top}>
                <PrintJar cents={cents} goal={kid.goal} now={now} />
                <CoinSheet />
              </div>
              {jobs.length > 0 ? <JobsTable kid={kid} jobs={jobs} /> : <NoJobs name={kid.name} />}
            </section>
          ) : (
            <>
              <section className={sheet.sheet} aria-label="Chart, page 1">
                <SheetHeader kid={kid} now={now} />
                <div className={`${sheet.top} ${sheet.topRoomy}`}>
                  <PrintJar cents={cents} goal={kid.goal} now={now} big />
                  <CoinSheet />
                </div>
              </section>
              <section className={`${sheet.sheet} ${sheet.sheetFlow}`} aria-label="Chart, jobs">
                <SheetHeader kid={kid} now={now} small />
                <JobsTable kid={kid} jobs={jobs} />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
