"use client";

import { PencilSimpleLine as PencilLineIcon } from "@phosphor-icons/react/dist/ssr";
import type { ChatMessage } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { AppIcon } from "../icons";
import { EditDiff } from "./chat/edit-diff";
import { MessageActions } from "./chat/message-actions";
import { SuggestionChips } from "./chat/suggestion-chips";
import { Thinking } from "./chat/thinking";

const STARTERS = ["Make it shorter", "Stronger hook", "More like me", "Add a story"];

type Props = {
  scriptId: string;
  messages: ChatMessage[];
  pending: string | null;
  onSend: (text: string) => void;
  onUndo: (versionId: string) => void;
  disabled: boolean;
};

function UserBubble({ text }: { text: string }) {
  return (
    <li className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl bg-surface-3 px-3.5 py-2 type-body-sm whitespace-pre-wrap text-text">
        {text}
      </p>
    </li>
  );
}

function AssistantLabel() {
  return (
    <p className="flex items-center gap-1.5 type-caption font-medium text-muted">
      <AppIcon.ai aria-hidden="true" className="size-3.5 text-brand" />
      Assistant
    </p>
  );
}

/** Empty: a centred prompt with starters. Then a plain thread: your pills right, replies left. */
export function ChatThread({ scriptId, messages, pending, onSend, onUndo, disabled }: Props) {
  if (messages.length === 0 && !pending) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-tint-violet-bg text-tint-violet">
          <AppIcon.ai aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="type-card-title">What should change?</h3>
          <p className="type-body-sm text-muted">
            I edit the script directly. You see every change and can undo it.
          </p>
        </div>
        <SuggestionChips
          items={STARTERS}
          onPick={onSend}
          disabled={disabled}
          className="justify-center"
        />
      </div>
    );
  }
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  return (
    <ol className="flex flex-col gap-5 p-4">
      {messages.map((m) =>
        m.role === "user" ? (
          <UserBubble key={m.id} text={m.text} />
        ) : (
          <li key={m.id} className="flex min-w-0 flex-col gap-2">
            <AssistantLabel />
            <p className={cn("type-body-sm text-text", m.error && "text-danger")}>{m.text}</p>
            {m.change?.diff?.rows.length ? (
              <EditDiff
                summary={m.change.summary}
                diff={m.change.diff}
                undoDisabled={disabled}
                onUndo={() => onUndo(m.change!.undoVersionId)}
              />
            ) : m.change ? (
              <p className="flex items-center gap-1.5 type-caption text-muted">
                <PencilLineIcon aria-hidden="true" className="size-3.5 text-success" />
                {m.change.summary}
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onUndo(m.change!.undoVersionId)}
                  className="font-medium text-brand-strong hover:underline"
                >
                  Undo
                </button>
              </p>
            ) : null}
            {m.id === lastAssistant?.id && m.suggestions?.length && !pending ? (
              <SuggestionChips items={m.suggestions} onPick={onSend} disabled={disabled} />
            ) : null}
            {!m.error ? <MessageActions scriptId={scriptId} message={m} /> : null}
          </li>
        ),
      )}
      {pending ? (
        <>
          <UserBubble text={pending} />
          <li className="flex flex-col gap-1">
            <AssistantLabel />
            <Thinking label="Reading your script…" />
          </li>
        </>
      ) : null}
    </ol>
  );
}
