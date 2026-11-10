"use client";

import { useId, useState, useTransition } from "react";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { addAccountAction } from "@/app/(app)/_actions/discover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Add a tracked account; the provider checks it exists and is public. */
export function AddAccountForm({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addAccountAction(value);
          if (res.ok) {
            setValue("");
            setError(null);
            toast.success(`Now tracking @${res.handle}. Its outliers are in your feed.`);
          } else setError(res.error);
        });
      }}
    >
      <label htmlFor={id} className={compact ? "sr-only" : "type-label text-text"}>
        Add an account
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@handle"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-10"
        />
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          disabled={pending || !value.trim()}
          aria-label="Add account"
        >
          <PlusIcon />
        </Button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="type-caption text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
