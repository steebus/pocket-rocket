"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/art/Icon";
import { KidForm } from "@/components/parent/KidForm";
import ui from "@/components/parent/ui.module.css";

export default function NewKidPage() {
  const router = useRouter();
  return (
    <div className={ui.page}>
      <Link href="/parent" className={ui.backLink}>
        <Icon name="back" size={18} />
        All kids
      </Link>
      <h1 className={ui.h1}>Add a kid</h1>
      <KidForm submitLabel="Add kid" onSaved={() => router.push("/parent")} />
    </div>
  );
}
