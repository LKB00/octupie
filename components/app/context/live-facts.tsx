"use client";

import { useState, useTransition } from "react";
import {
  Check as CheckIcon,
  PencilSimple as PencilIcon,
  Plus as PlusIcon,
  ArrowClockwise as RefreshCwIcon,
  Trash as Trash2Icon,
  X as XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { factAction } from "@/app/(app)/_actions/context";
import { Button } from "@/components/ui/button";

export type FactRow = { id: string; label: string; value: string; checked: string };

const field =
  "h-9 min-w-0 rounded-sm border border-border bg-surface px-3 type-body-sm placeholder:text-faint focus-visible:border-brand focus-visible:outline-none";

function Fact({ fact }: { fact: FactRow }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fact.value);
  const [pending, start] = useTransition();
  const run = (op: "update" | "delete" | "refresh", ok?: string) =>
    start(async () => {
      const res = await factAction({ op, id: fact.id, value });
      if (!res.ok) return void toast.error(res.message);
      setEditing(false);
      if (ok) toast.success(ok);
    });
  return (
    <li className="grid grid-cols-1 items-center gap-x-4 gap-y-1 py-3 @lg:grid-cols-[140px_minmax(0,1fr)_auto]">
      <span className="type-caption font-medium text-muted">{fact.label}</span>
      {editing ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run("update", `${fact.label} updated.`);
          }}
        >
          <input
            aria-label={fact.label}
            autoFocus
            value={value}
            maxLength={200}
            onChange={(e) => setValue(e.target.value)}
            className={`${field} flex-1`}
          />
          <Button
            type="submit"
            size="icon-sm"
            aria-label="Save"
            disabled={pending || !value.trim()}
          >
            <CheckIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel"
            onClick={() => setEditing(false)}
          >
            <XIcon />
          </Button>
        </form>
      ) : (
        <div className="min-w-0">
          <p className="type-body-sm">{fact.value}</p>
          <p className="type-caption text-faint">Checked {fact.checked}</p>
        </div>
      )}
      {!editing ? (
        <div className="flex gap-1 @max-lg:-ml-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Check ${fact.label} again`}
            disabled={pending}
            onClick={() => run("refresh", `${fact.label} is still current.`)}
          >
            <RefreshCwIcon className={pending ? "animate-spin" : undefined} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${fact.label}`}
            onClick={() => {
              setValue(fact.value);
              setEditing(true);
            }}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${fact.label}`}
            disabled={pending}
            onClick={() => run("delete")}
          >
            <Trash2Icon />
          </Button>
        </div>
      ) : null}
    </li>
  );
}

/** Numbers and details that go stale: follower count, price, location. Scripts quote these. */
export function LiveFacts({ facts }: { facts: FactRow[] }) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();
  return (
    <section className="@container flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
      <div>
        <h3 className="type-card-title">Live facts</h3>
        <p className="type-caption text-muted">
          Details scripts quote word for word. Check them again when they change. Free.
        </p>
      </div>
      {facts.length ? (
        <ul className="divide-y divide-border">
          {facts.map((f) => (
            <Fact key={f.id} fact={f} />
          ))}
        </ul>
      ) : (
        <p className="py-3 type-body-sm text-muted">
          No facts yet. Add your follower count or your offer&apos;s price below.
        </p>
      )}
      <form
        className="flex flex-wrap gap-2 border-t border-border pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await factAction({ op: "add", label, value });
            if (!res.ok) return void toast.error(res.message);
            setLabel("");
            setValue("");
          });
        }}
      >
        <input
          aria-label="Fact name"
          placeholder="Name, e.g. Price"
          value={label}
          maxLength={40}
          onChange={(e) => setLabel(e.target.value)}
          className={`${field} w-36 max-sm:flex-1`}
        />
        <input
          aria-label="Fact value"
          placeholder="Value, e.g. ₹2,999"
          value={value}
          maxLength={200}
          onChange={(e) => setValue(e.target.value)}
          className={`${field} flex-1 basis-48`}
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="h-9"
          disabled={pending || !label.trim() || !value.trim()}
        >
          <PlusIcon aria-hidden="true" /> Add fact
        </Button>
      </form>
    </section>
  );
}
