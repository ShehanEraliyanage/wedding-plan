"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getBudgetPackageId,
  getBudgetPackageSnapshot,
  getBudgetSnapshot,
  getBudgetTargets,
  getBudgetTargetsSnapshot,
  getBudgetTotal,
  getCompareIds,
  getCompareSnapshot,
  subscribe,
} from "@/lib/compareStore";
import {
  getPackageCompareIds,
  getPackageCompareSnapshot,
  subscribePackageCompare,
} from "@/lib/packageCompareStore";

/** Reactive list of vendor ids selected for comparison. */
export function useCompareIds(): string[] {
  const snapshot = useSyncExternalStore(subscribe, getCompareSnapshot, () => "[]");
  // Parse keyed on the stable string snapshot to keep a stable array reference.
  return useMemo(() => {
    void snapshot;
    return getCompareIds();
  }, [snapshot]);
}

/** Reactive list of wedding-package ids selected for comparison. */
export function usePackageCompareIds(): string[] {
  const snapshot = useSyncExternalStore(
    subscribePackageCompare,
    getPackageCompareSnapshot,
    () => "[]",
  );
  return useMemo(() => {
    void snapshot;
    return getPackageCompareIds();
  }, [snapshot]);
}

/** Reactive total budget. */
export function useBudgetTotal(): number {
  const snapshot = useSyncExternalStore(subscribe, getBudgetSnapshot, () => "0");
  return useMemo(() => {
    void snapshot;
    return getBudgetTotal();
  }, [snapshot]);
}

/** Reactive per-section budget overrides (bucketId -> custom amount). */
export function useBudgetTargets(): Record<string, number> {
  const snapshot = useSyncExternalStore(subscribe, getBudgetTargetsSnapshot, () => "{}");
  return useMemo(() => {
    void snapshot;
    return getBudgetTargets();
  }, [snapshot]);
}

/** Reactive id of the package the budget tracks against ("" if none). */
export function useBudgetPackageId(): string {
  const snapshot = useSyncExternalStore(subscribe, getBudgetPackageSnapshot, () => "");
  return useMemo(() => {
    void snapshot;
    return getBudgetPackageId();
  }, [snapshot]);
}
