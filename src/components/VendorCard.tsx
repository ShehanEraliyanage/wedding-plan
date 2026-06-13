"use client";

import Link from "next/link";
import { categoryMeta } from "@/lib/categories";
import { cheapestPackage, formatCurrency, packagePriceLabel } from "@/lib/format";
import { toggleCompare } from "@/lib/compareStore";
import { useCompareIds } from "@/lib/hooks";
import type { VendorSlim } from "@/types";
import CategoryChip from "@/components/CategoryChip";
import StarRating from "@/components/StarRating";

export default function VendorCard({ vendor }: { vendor: VendorSlim }) {
  const selected = useCompareIds().includes(vendor._id!);
  const meta = categoryMeta(vendor.category);
  const cheapest = cheapestPackage(vendor.packages);

  const priceLabel = cheapest
    ? `from ${packagePriceLabel(cheapest)}`
    : vendor.estimatedCost != null
      ? `~${formatCurrency(vendor.estimatedCost)}`
      : "No price yet";

  return (
    <div className="relative flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
      <Link href={`/vendors/${vendor._id}`} className="flex min-w-0 flex-1 gap-3">
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${meta.chip}`}
        >
          {meta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-gray-900">{vendor.name}</h3>
          </div>
          <div className="mt-0.5">
            <CategoryChip category={vendor.category} showIcon={false} />
          </div>
          <p className="mt-1 text-sm font-medium text-brand-700">{priceLabel}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
            {vendor.location && <span className="truncate">📍 {vendor.location}</span>}
            {vendor.photoCount > 0 && <span>📷 {vendor.photoCount}</span>}
            {vendor.rating ? <StarRating value={vendor.rating} size="sm" /> : null}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleCompare(vendor._id!)}
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
