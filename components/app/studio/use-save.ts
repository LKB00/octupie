"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { saveScriptContentAction } from "@/app/(app)/_actions/studio";
import type { ScriptContent } from "@/lib/ai/schemas";

/** Save a manual edit as a new version (one undo step). */
export function useSaveContent(scriptId: string) {
  const [pending, start] = useTransition();
  const save = (content: ScriptContent, reason: string) =>
    start(async () => {
      try {
        await saveScriptContentAction({ scriptId, content, reason });
      } catch {
        toast.error("That edit didn't save. Check the line is under 140 characters and try again.");
      }
    });
  return { save, pending };
}
