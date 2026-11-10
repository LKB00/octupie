"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

/**
 * Sidebar open/hidden, shared by the sidebar and the top bar's "Show sidebar" button.
 * Default: open on wide screens, hidden below 1024 px. The user's choice is remembered in this
 * browser (a per-viewer convenience, so localStorage is fine).
 */
const KEY = "octupie.sidebar";
const EVENT = "octupie:sidebar";
const NARROW = "(max-width: 1023.98px)";

function readPref(): "open" | "hidden" | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "open" || v === "hidden" ? v : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const snapshot = () => {
  const pref = readPref();
  return pref ? pref === "open" : !window.matchMedia(NARROW).matches;
};

type Ctx = { open: boolean; setOpen: (open: boolean) => void };
const SidebarContext = createContext<Ctx>({ open: true, setOpen: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const open = useSyncExternalStore(subscribe, snapshot, () => true);
  const setOpen = useCallback((next: boolean) => {
    try {
      window.localStorage.setItem(KEY, next ? "open" : "hidden");
    } catch {
      /* storage blocked: the choice lasts until reload */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  // ⌘\ or Ctrl+\ toggles the sidebar anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "\\" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!snapshot());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>;
}

export const useSidebar = () => useContext(SidebarContext);
