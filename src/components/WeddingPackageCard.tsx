"use client";

import Link from "next/link";
import { categoryMeta } from "@/lib/categories";
import { formatCurrency, packageTotal } from "@/lib/format";
import { togglePackageCompare } from "@/lib/packageCompareStore";
import { usePackageCompareIds } from "@/lib/hooks";
import type { WeddingPackage } from "@/types";

export default function WeddingPackageCard({ weddingPackage }: { weddingPackage: WeddingPackage }) {
  const selected = usePackageCompareIds().includes(weddingPackage._id!);
  const total = packageTotal(weddingPackage);

  return (
    <div className="relative flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
      <Link href={`/packages/${weddingPackage._id}`} className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-gray-900">{weddingPackage.name}</h3>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-lg leading-none">
          {weddingPackage.items.length ? (
            weddingPackage.items.map((it, i) => (
              <span key={`${it.vendorId}-${i}`} title={it.vendorName}>
                {categoryMeta(it.category).icon}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">No vendors yet</span>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold text-brand-700">{formatCurrency(total)}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
          <span>
            {weddingPackage.items.length} vendor{weddingPackage.items.length === 1 ? "" : "s"}
          </span>
          {weddingPackage.guestCount != null && <span>· 👥 {weddingPackage.guestCount}</span>}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => togglePackageCompare(weddingPackage._id!)}
        aria-pressed={selected}
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center self-start rounded-full border text-sm ${
          selected
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-gray-300 bg-white text-gray-400"
        }`}
        title="Add to compare"
      >
        {selected ? "✓" : "⚖"}
      </button>
    </div>
  );
}
