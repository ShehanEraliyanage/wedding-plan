"use client";

// LocalStorage-backed UI state that needs no DB and no login:
//  - the set of vendor ids selected for comparison (max 3)
//  - the user's total wedding budget
// Both expose a subscribe() so React components stay in sync via useSyncExternalStore.

const COMPARE_KEY = "wp.compare";
const BUDGET_KEY = "wp.budget";
const TARGETS_KEY = "wp.budget.targets";
const BUDGET_PACKAGE_KEY = "wp.budget.package";
export const MAX_COMPARE = 3;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  // Sync across tabs.
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === COMPARE_KEY ||
      e.key === BUDGET_KEY ||
      e.key === TARGETS_KEY ||
      e.key === BUDGET_PACKAGE_KEY
    )
      listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
  emit();
}

// ---- compare selection ----

let compareCache = "[]";

export function getCompareSnapshot(): string {
  return read(COMPARE_KEY) ?? compareCache;
}

export function getCompareIds(): string[] {
  try {
    const parsed = JSON.parse(getCompareSnapshot());
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toggleCompare(id: string): void {
  const ids = getCompareIds();
  let next: string[];
  if (ids.includes(id)) {
    next = ids.filter((x) => x !== id);
  } else {
    next = ids.length >= MAX_COMPARE ? [...ids.slice(1), id] : [...ids, id];
  }
  compareCache = JSON.stringify(next);
  write(COMPARE_KEY, compareCache);
}

export function clearCompare(): void {
  compareCache = "[]";
  write(COMPARE_KEY, compareCache);
}

export function removeCompare(id: string): void {
  const next = getCompareIds().filter((x) => x !== id);
  compareCache = JSON.stringify(next);
  write(COMPARE_KEY, compareCache);
}

// ---- budget total ----

export function getBudgetSnapshot(): string {
  return read(BUDGET_KEY) ?? "0";
}

export function getBudgetTotal(): number {
  const n = Number(getBudgetSnapshot());
  return Number.isFinite(n) ? n : 0;
}

export function setBudgetTotal(value: number): void {
  write(BUDGET_KEY, String(Number.isFinite(value) ? value : 0));
}

// ---- per-section budget targets (overrides of the recommended split) ----

export function getBudgetTargetsSnapshot(): string {
  return read(TARGETS_KEY) ?? "{}";
}

export function getBudgetTargets(): Record<string, number> {
  try {
    const parsed = JSON.parse(getBudgetTargetsSnapshot());
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function setBudgetTarget(id: string, amount: number): void {
  const next = getBudgetTargets();
  next[id] = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  write(TARGETS_KEY, JSON.stringify(next));
}

/** Remove a custom override so the section falls back to the recommended %. */
export function resetBudgetTarget(id: string): void {
  const next = getBudgetTargets();
  delete next[id];
  write(TARGETS_KEY, JSON.stringify(next));
}

// ---- the package whose cost the budget tracks against ----

export function getBudgetPackageSnapshot(): string {
  return read(BUDGET_PACKAGE_KEY) ?? "";
}

export function getBudgetPackageId(): string {
  return getBudgetPackageSnapshot();
}

export function setBudgetPackageId(id: string): void {
  write(BUDGET_PACKAGE_KEY, id);
}
