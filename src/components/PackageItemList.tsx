import Link from "next/link";
import { categoryMeta } from "@/lib/categories";
import { formatCurrency, itemCost, priceTypeLabel } from "@/lib/format";
import type { WeddingPackageItem } from "@/types";

export default function PackageItemList({
  items,
  guestCount,
}: {
  items: WeddingPackageItem[];
  guestCount?: number;
}) {
  if (!items.length) {
    return <p className="text-sm text-gray-400">No vendors in this package yet.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={`${item.vendorId}-${i}`}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
        >
          <span className="text-2xl">{categoryMeta(item.category).icon}</span>
          <div className="min-w-0 flex-1">
            <Link href={`/vendors/${item.vendorId}`} className="block truncate font-medium text-gray-900">
              {item.vendorName}
            </Link>
            <p className="text-xs text-gray-500">
              {item.tierName ?? "Estimated cost"}
              {item.priceType === "per_pax" && ` · ${formatCurrency(item.price)} ${priceTypeLabel("per_pax")}`}
            </p>
          </div>
          <span className="whitespace-nowrap font-semibold text-brand-700">
            {formatCurrency(itemCost(item, guestCount))}
          </span>
        </div>
      ))}
    </div>
  );
}
