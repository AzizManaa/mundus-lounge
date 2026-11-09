import { parseCommand, type Command } from "./types";
const key = "mundus-loyalty-pending";
let fallback: string | null = null;
const listeners = new Set<() => void>();

export function subscribePending(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}
export function pendingSnapshot() {
  try {
    return sessionStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
export function readPending(value: string | null): Command | null {
  try {
    return value ? parseCommand(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}
export function setPending(command: Command | null) {
  fallback = command ? JSON.stringify(command) : null;
  try {
    if (fallback) sessionStorage.setItem(key, fallback);
    else sessionStorage.removeItem(key);
  } catch {
    /* In-memory protection still prevents duplicates when storage is blocked. */
  }
  for (const notify of listeners) notify();
}
