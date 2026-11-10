"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { NativeSelect } from "@/components/ui/select";
import type { Pillar } from "@/lib/db/types";
import { AppIcon } from "../icons";

/** Sort and pillar filter for the profile grid, kept in the URL. */
export function ReelsToolbar({
  sort,
  pillar,
  pillars,
}: {
  sort: "newest" | "multiple";
  pillar: string | null;
  pillars: Pillar[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, start] = useTransition();
  const go = (next: { sort?: string; pillar?: string | null }) => {
    const q = new URLSearchParams();
    const s = next.sort ?? sort;
    const p = next.pillar === undefined ? pillar : next.pillar;
    if (s !== "newest") q.set("sort", s);
    if (p) q.set("pillar", p);
    start(() => router.push(q.size ? `${pathname}?${q}` : pathname, { scroll: false }));
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        size="sm"
        aria-label="Sort"
        options={[
          { value: "newest", label: "Newest" },
          { value: "multiple", label: "Highest multiple" },
        ]}
        value={sort}
        onValueChange={(v) => go({ sort: v })}
      />
      <NativeSelect
        size="sm"
        aria-label="Pillar"
        icon={<AppIcon.pillar />}
        value={pillar ?? ""}
        onChange={(e) => go({ pillar: e.target.value || null })}
      >
        <option value="">All pillars</option>
        {pillars.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
