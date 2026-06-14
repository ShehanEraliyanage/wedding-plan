"use client";

import { useEffect, useState } from "react";
import { usePackageCompareIds } from "@/lib/hooks";
import { clearPackageCompare, removePackageCompare } from "@/lib/packageCompareStore";
import type { WeddingPackage } from "@/types";
import PackageCompareTable from "@/components/PackageCompareTable";
import EmptyState from "@/components/EmptyState";

export default function ComparePackagesPage() {
  const ids = usePackageCompareIds();
  const [packages, setPackages] = useState<WeddingPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/packages/${id}`).then((r) => (r.ok ? r.json() : null))),
      );
      if (!cancelled) {
        setPackages(results.filter((p): p is WeddingPackage => Boolean(p)));
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
        <h1 className="text-2xl font-bold text-gray-900">Compare packages</h1>
        {ids.length > 0 && (
          <button onClick={clearPackageCompare} className="text-sm font-medium text-gray-500">
            Clear all
          </button>
        )}
      </div>

      {ids.length < 2 ? (
        <EmptyState
          icon="⚖️"
          title="Pick at least 2 packages"
          message="On the Packages tab, tap the scale icon on any package to add it here for a side-by-side comparison."
          actionHref="/packages"
          actionLabel="Go to packages"
        />
      ) : loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
      ) : (
        <PackageCompareTable packages={packages} onRemove={removePackageCompare} />
      )}
    </div>
  );
}
