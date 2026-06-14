"use client";

// LocalStorage-backed selection of wedding-package ids chosen for comparison
// (max 3), kept independent from the vendor compare store. Exposes a subscribe()
// so React components stay in sync via useSyncExternalStore.

const KEY = "wp.compare.packages";
export const MAX_PACKAGE_COMPARE = 3;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribePackageCompare(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function read(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(value: string) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    /* ignore quota / private mode */
  }
  emit();
}

let cache = "[]";

export function getPackageCompareSnapshot(): string {
  return read() ?? cache;
}

export function getPackageCompareIds(): string[] {
  try {
    const parsed = JSON.parse(getPackageCompareSnapshot());
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function togglePackageCompare(id: string): void {
  const ids = getPackageCompareIds();
  let next: string[];
  if (ids.includes(id)) {
    next = ids.filter((x) => x !== id);
  } else {
    next = ids.length >= MAX_PACKAGE_COMPARE ? [...ids.slice(1), id] : [...ids, id];
  }
  cache = JSON.stringify(next);
  write(cache);
}

export function clearPackageCompare(): void {
  cache = "[]";
  write(cache);
}

export function removePackageCompare(id: string): void {
  const next = getPackageCompareIds().filter((x) => x !== id);
  cache = JSON.stringify(next);
  write(cache);
}
