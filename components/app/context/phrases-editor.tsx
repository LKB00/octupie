"use client";

import { useState, useTransition } from "react";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr";
import { setPhrasesAction } from "@/app/(app)/_actions/context";

/** Signature phrases as removable chips; Enter adds one. Each change saves a voice version. */
export function PhrasesEditor({ phrases }: { phrases: string[] }) {
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const save = (next: string[]) => start(() => setPhrasesAction(next));
  const full = phrases.length >= 8;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-busy={pending}>
      {phrases.map((p, i) => (
        <span
          key={`${p}-${i}`}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-surface-2 pr-1 pl-3 type-body-sm"
        >
          {p}
          <button
            type="button"
            aria-label={`Remove “${p}”`}
            disabled={pending}
            onClick={() => save(phrases.filter((_, j) => j !== i))}
            className="inline-flex size-6 items-center justify-center rounded-full text-muted hover:bg-surface-3 hover:text-text"
          >
            <XIcon className="size-3.5" />
          </button>
        </span>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim() || full) return;
          save([...phrases, draft]);
          setDraft("");
        }}
      >
        <label htmlFor="add-phrase" className="sr-only">
          Add a phrase
        </label>
        <input
          id="add-phrase"
          value={draft}
          disabled={full}
          maxLength={60}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={full ? "8 phrases max" : "Add a phrase, press Enter"}
          className="h-8 w-60 max-w-full rounded-full border border-dashed border-border-strong bg-transparent px-3 type-body-sm placeholder:text-faint focus-visible:border-brand focus-visible:outline-none"
        />
      </form>
    </div>
  );
}
