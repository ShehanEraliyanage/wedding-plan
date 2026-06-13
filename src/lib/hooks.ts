"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getBudgetSnapshot,
  getBudgetTotal,
  getCompareIds,
  getCompareSnapshot,
  subscribe,
} from "@/lib/compareStore";

/** Reactive list of vendor ids selected for comparison. */
export function useCompareIds(): string[] {
  const snapshot = useSyncExternalStore(subscribe, getCompareSnapshot, () => "[]");
  // Parse keyed on the stable string snapshot to keep a stable array reference.
  return useMemo(() => {
    void snapshot;
    return getCompareIds();
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
