"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Check as CheckIcon,
  Copy as CopyIcon,
  ThumbsDown as ThumbsDownIcon,
  ThumbsUp as ThumbsUpIcon,
  X as XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { messageFeedbackAction } from "@/app/(app)/_actions/studio";
import type { ChatMessage } from "@/lib/db/types";
import { cn } from "@/lib/utils";

const REASONS = ["Not what I asked", "Too long", "Doesn't sound like me", "Other"];

const iconBtn =
  "inline-flex size-7 items-center justify-center rounded-sm text-faint transition-colors hover:bg-surface-2 hover:text-text";

/** Copy and thumbs under a reply; thumbs down asks what went wrong in one tap. */
export function MessageActions({ scriptId, message }: { scriptId: string; message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const [asking, setAsking] = useState(false);
  const [, start] = useTransition();
  const askRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (asking) askRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [asking]);
  const value = message.feedback?.value ?? null;
  const send = (v: "up" | "down" | null, reason?: string) =>
    start(() => messageFeedbackAction({ scriptId, messageId: message.id, value: v, reason }));

  return (
    <div className="flex flex-col gap-2">
      <div className="-ml-1.5 flex items-center gap-0.5">
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy reply"}
          className={iconBtn}
          onClick={async () => {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-success" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          aria-label="Good reply"
          aria-pressed={value === "up"}
          className={cn(iconBtn, value === "up" && "text-text")}
          onClick={() => {
            setAsking(false);
            send(value === "up" ? null : "up");
          }}
        >
          <ThumbsUpIcon weight={value === "up" ? "fill" : "regular"} className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Bad reply"
          aria-pressed={value === "down"}
          aria-expanded={asking}
          className={cn(iconBtn, value === "down" && "text-text")}
          onClick={() => {
            if (value === "down") {
              setAsking(false);
              return send(null);
            }
            setAsking(true);
          }}
        >
          <ThumbsDownIcon weight={value === "down" ? "fill" : "regular"} className="size-3.5" />
        </button>
      </div>
      {asking ? (
        <div ref={askRef} className="flex flex-col gap-2 rounded-[10px] border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="type-label">What went wrong?</p>
            <button
              type="button"
              aria-label="Close"
              className={iconBtn}
              onClick={() => setAsking(false)}
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  send("down", r);
                  setAsking(false);
                  toast.success("Thanks. We use this to tune your next edits.");
                }}
                className="h-7 rounded-sm bg-surface-2 px-2.5 type-caption font-medium text-text hover:bg-surface-3"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
