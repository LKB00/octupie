import "server-only";
import { store } from "./mock-store";
import type { Notification, NotificationPrefs } from "./types";

export function listNotifications(): Notification[] {
  return [...store().notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markAllRead(): void {
  for (const n of store().notifications) n.read = true;
}

export function getPrefs(): NotificationPrefs {
  return store().prefs;
}

export function setPref(key: keyof NotificationPrefs, value: boolean): void {
  store().prefs[key] = value;
}
