"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { checkHandleAction } from "@/app/(app)/_actions/onboarding";
import { IgAvatar } from "@/components/app/ig/ig-avatar";
import { Button } from "@/components/ui/button";
import { igCount } from "@/lib/format";
import { StepFooter, StepTitle } from "./frame";

type Profile = { handle: string; name: string; avatarUrl: string; followers: number };

export function HandleStep({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const check = () =>
    start(async () => {
      setError(null);
      const res = await checkHandleAction(value);
      if (res.ok) setProfile(res.profile);
      else {
        setProfile(null);
        setError(res.message);
      }
    });
  return (
    <>
      <StepTitle
        title="What's your Instagram handle?"
        sub="We read your public reels to learn what you post and how you sound. Nothing is posted for you."
      />
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <label htmlFor="handle" className="type-label">
          Instagram handle
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 type-body text-muted"
            >
              @
            </span>
            <input
              id="handle"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              value={value}
              aria-invalid={!!error}
              aria-describedby="handle-msg"
              onChange={(e) => {
                setValue(e.target.value);
                setProfile(null);
                setError(null);
              }}
              className="h-11 w-full rounded-[10px] border border-border bg-surface pr-3 pl-8 type-body focus-visible:border-brand focus-visible:shadow-glow focus-visible:outline-none aria-invalid:border-danger"
            />
          </div>
          <Button type="submit" size="lg" variant="secondary" disabled={pending || !value.trim()}>
            {pending ? "Checking…" : "Check"}
          </Button>
        </div>
        <p
          id="handle-msg"
          role={error ? "alert" : undefined}
          className={error ? "type-caption text-danger" : "type-caption text-muted"}
        >
          {error ?? "Must be a public or professional account. Try “demo.creator”."}
        </p>
      </form>
      {profile ? (
        <div
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
          aria-live="polite"
        >
          <IgAvatar src={profile.avatarUrl} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate type-label">{profile.handle}</p>
            <p className="truncate type-caption text-muted">
              {profile.name} · {igCount(profile.followers)} followers
            </p>
          </div>
          <span className="type-caption font-medium text-success">Found</span>
        </div>
      ) : null}
      <StepFooter>
        <Button size="lg" disabled={!profile} onClick={() => router.push("/onboarding/understood")}>
          That&apos;s me, continue
        </Button>
      </StepFooter>
    </>
  );
}
