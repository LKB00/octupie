"use client";

import { useState, useTransition } from "react";
import { PencilSimple as PencilIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { updateStrategyFieldAction } from "@/app/(app)/_actions/context";
import { Button } from "@/components/ui/button";
import type { StrategyField } from "@/lib/db/types";

/** A strategy doc you can edit in place. */
export function EditableText({
  field,
  title,
  value,
}: {
  field: StrategyField;
  title: string;
  value: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, start] = useTransition();
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="type-card-title">{title}</h3>
        {!editing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            aria-label={`Edit ${title}`}
          >
            <PencilIcon aria-hidden="true" /> Edit
          </Button>
        ) : null}
      </div>
      {editing ? (
        <div className="flex flex-col gap-3">
          <label htmlFor={`f-${field}`} className="sr-only">
            {title}
          </label>
          <textarea
            id={`f-${field}`}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={600}
            rows={4}
            className="w-full rounded-[10px] border border-border bg-surface p-3 type-body-sm focus-visible:border-brand focus-visible:shadow-glow focus-visible:outline-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={pending || !draft.trim()}
              onClick={() =>
                start(async () => {
                  const res = await updateStrategyFieldAction({ field, value: draft });
                  if (!res.ok) return void toast.error(res.message);
                  setEditing(false);
                  toast.success(`${title} saved. New scripts will use it.`);
                })
              }
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="type-body-sm text-text">{value}</p>
      )}
    </section>
  );
}
