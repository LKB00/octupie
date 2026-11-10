"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/lib/theme/use-theme";

/**
 * Toasts: radius md, surface, icon coloured by tone, auto-dismiss after 4s,
 * paused while hovered (Sonner's default). Call `toast()` from "sonner".
 */
function Toaster(props: ToasterProps) {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      duration={4000}
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-brand-strong" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--text)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--r-md)",
          fontFamily: "var(--font-body)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "shadow-pop! type-body-sm",
          description: "text-muted!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
