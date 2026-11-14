"use client";

import { useState } from "react";
import { Icon } from "@/components/art/Icon";
import { JobIcon } from "@/components/art/JobIcon";
import { Mascot } from "@/components/art/Mascot";
import { JobSheet } from "@/components/parent/JobSheet";
import { REPEAT_LABEL } from "@/components/parent/labels";
import ui from "@/components/parent/ui.module.css";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/money";
import { usePocket } from "@/lib/store";
import styles from "./page.module.css";

export default function JobsPage() {
  const { state } = usePocket();
  const [sheet, setSheet] = useState<{ jobId: string | null; open: boolean } | null>(null);
  const jobs = state.jobs.filter((j) => !j.archived);
  const editing = sheet?.jobId ? state.jobs.find((j) => j.id === sheet.jobId) : undefined;

  return (
    <div className={ui.page}>
      <div className={ui.pageHead}>
        <h1 className={ui.h1}>Jobs</h1>
        <Button variant="ok" onClick={() => setSheet({ jobId: null, open: true })}>
          <Icon name="plus" size={20} />
          Add a job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <p className={ui.empty}>No jobs yet. Add one and choose which kids can claim it.</p>
      ) : (
        <ul className={ui.list}>
          {jobs.map((job) => {
            const kids = state.kids.filter((k) => job.kidIds.includes(k.id));
            return (
              <li key={job.id}>
                <button
                  type="button"
                  className={styles.rowBtn}
                  onClick={() => setSheet({ jobId: job.id, open: true })}
                >
                  <span className={styles.pic}>
                    <JobIcon id={job.icon} size={44} />
                  </span>
                  <span className={ui.grow}>
                    <strong className={ui.name}>{job.name}</strong>
                    <span className={ui.sub}>
                      <b data-money>{formatCents(job.valueCents)}</b> · {REPEAT_LABEL[job.repeat]}
                    </span>
                  </span>
                  <span className={styles.faces} aria-hidden="true">
                    {kids.map((k) => (
                      <Mascot key={k.id} id={k.mascot} color={k.color} size={28} />
                    ))}
                  </span>
                  <span className={styles.edit} aria-hidden="true">
                    <Icon name="edit" size={20} />
                  </span>
                  <span style={srOnly}>
                    {kids.length > 0 ? `For ${kids.map((k) => k.name).join(", ")}. ` : "Not assigned to anyone. "}Edit job
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {sheet && (
        <JobSheet
          key={sheet.jobId ?? "new"}
          job={editing}
          open={sheet.open}
          onClose={() => setSheet((s) => (s ? { ...s, open: false } : s))}
        />
      )}
    </div>
  );
}

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;
