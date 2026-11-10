"use client";

import { useState, useTransition } from "react";
import { PencilSimple as PencilIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { updatePillarAction } from "@/app/(app)/_actions/context";
import { Button } from "@/components/ui/button";
import type { Pillar } from "@/lib/db/types";

function PillarRow({ pillar }: { pillar: Pillar }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pillar.name);
  const [desc, setDesc] = useState(pillar.description);
  const [pending, start] = useTransition();
  if (!editing) {
    return (
      <li className="flex items-start gap-3 rounded-[10px] border border-border p-3">
        <div className="min-w-0 flex-1">
          <p className="type-label">{pillar.name}</p>
          <p className="type-caption text-muted">{pillar.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${pillar.name}`}
          onClick={() => setEditing(true)}
        >
          <PencilIcon />
        </Button>
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-2 rounded-[10px] border border-brand p-3">
      <input
        aria-label="Pillar name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        className="h-8 rounded-sm border border-border px-2 type-label focus-visible:border-brand focus-visible:outline-none"
      />
      <textarea
        aria-label="Pillar description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        maxLength={160}
        rows={2}
        className="resize-none rounded-sm border border-border p-2 type-caption focus-visible:border-brand focus-visible:outline-none"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await updatePillarAction({ id: pillar.id, name, description: desc });
              if (!res.ok) return void toast.error(res.message);
              setEditing(false);
            })
          }
        >
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </li>
  );
}

export function PillarsEditor({ pillars }: { pillars: Pillar[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <div>
        <h3 className="type-card-title">Pillars</h3>
        <p className="type-caption text-muted">The themes your scripts rotate through. Up to 5.</p>
      </div>
      <ul className="grid gap-2 @2xl:grid-cols-2">
        {pillars.map((p) => (
          <PillarRow key={p.id} pillar={p} />
        ))}
      </ul>
    </section>
  );
}
