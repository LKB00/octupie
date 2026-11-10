"use client";

import { useState, useTransition } from "react";
import { Plus as PlusIcon, X as XIcon } from "@phosphor-icons/react/dist/ssr";
import { setStrategyListAction } from "@/app/(app)/_actions/context";
import { Button } from "@/components/ui/button";

/** Proof bank / don't-use list: remove with ×, add with the field below. */
export function ListEditor({
  kind,
  title,
  hint,
  items,
  empty,
  placeholder,
}: {
  kind: "proof" | "dontUse";
  title: string;
  hint: string;
  items: string[];
  empty: string;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const save = (next: string[]) => start(() => setStrategyListAction({ kind, items: next }));
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <div>
        <h3 className="type-card-title">{title}</h3>
        <p className="type-caption text-muted">{hint}</p>
      </div>
      {items.length ? (
        <ul className="flex flex-col gap-1">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="group/li flex items-start gap-2 rounded-sm py-1 pr-1 pl-2 hover:bg-surface-2"
            >
              <span className="flex-1 type-body-sm">{item}</span>
              <button
                type="button"
                aria-label={`Remove “${item}”`}
                disabled={pending}
                onClick={() => save(items.filter((_, j) => j !== i))}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted opacity-0 group-focus-within/li:opacity-100 group-hover/li:opacity-100 hover:bg-surface-3 hover:text-text"
              >
                <XIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body-sm text-muted">{empty}</p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          save([...items, draft]);
          setDraft("");
        }}
      >
        <label htmlFor={`add-${kind}`} className="sr-only">
          Add to {title}
        </label>
        <input
          id={`add-${kind}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={160}
          placeholder={placeholder}
          className="h-9 min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 type-body-sm placeholder:text-faint focus-visible:border-brand focus-visible:outline-none"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={pending || !draft.trim()}>
          <PlusIcon aria-hidden="true" /> Add
        </Button>
      </form>
    </section>
  );
}
