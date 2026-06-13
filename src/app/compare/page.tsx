"use client";

import { useEffect, useState } from "react";
import { useCompareIds } from "@/lib/hooks";
import { clearCompare, removeCompare } from "@/lib/compareStore";
import type { Vendor } from "@/types";
import CompareTable from "@/components/CompareTable";
import EmptyState from "@/components/EmptyState";

export default function ComparePage() {
  const ids = useCompareIds();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/vendors/${id}`).then((r) => (r.ok ? r.json() : null))),
      );
      if (!cancelled) {
        setVendors(results.filter((v): v is Vendor => Boolean(v)));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Compare</h1>
        {ids.length > 0 && (
          <button onClick={clearCompare} className="text-sm font-medium text-gray-500">
            Clear all
          </button>
        )}
      </div>

      {ids.length < 2 ? (
        <EmptyState
          icon="⚖️"
          title="Pick at least 2 vendors"
          message="On the Vendors tab, tap the scale icon on any vendor to add it here for a side-by-side comparison."
          actionHref="/"
          actionLabel="Go to vendors"
        />
      ) : loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
      ) : (
        <CompareTable vendors={vendors} onRemove={removeCompare} />
      )}
    </div>
  );
}
