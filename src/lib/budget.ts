import { categoryMeta } from "@/lib/categories";
import { itemCost, packageTotal } from "@/lib/format";
import type { BucketId, BucketResult, WeddingPackage } from "@/types";

interface BucketDef {
  id: BucketId;
  label: string;
  pct: number;
  pctRange: [number, number];
}

// Midpoints of the user's planning guide split — used as the default target
// for each section until the user sets a custom amount.
export const BUCKETS: BucketDef[] = [
  { id: "venueFood", label: "Venue + Food", pct: 0.35, pctRange: [30, 40] },
  { id: "jewellery", label: "Jewellery", pct: 0.125, pctRange: [10, 15] },
  { id: "photoVideo", label: "Photo + Video", pct: 0.225, pctRange: [20, 25] },
  { id: "makeupDressing", label: "Makeup + Dressing", pct: 0.125, pctRange: [10, 15] },
  { id: "decor", label: "Decor", pct: 0.1, pctRange: [10, 10] },
  { id: "cakeExtras", label: "Cake + Extras", pct: 0.075, pctRange: [5, 10] },
];

/** A section's target: a custom override when set, else the recommended % of total. */
export function bucketTarget(total: number, pct: number, override?: number): number {
  return typeof override === "number" && override >= 0 ? override : total * pct;
}

export interface BucketSpend {
  amount: number;
  count: number;
}

/** Sum a package's item costs into budget buckets (via each item's category). */
export function spendByBucket(pkg: WeddingPackage | null): Record<BucketId, BucketSpend> {
  const acc = {} as Record<BucketId, BucketSpend>;
  for (const b of BUCKETS) acc[b.id] = { amount: 0, count: 0 };
  if (!pkg) return acc;
  for (const item of pkg.items) {
    const bucket = categoryMeta(item.category).bucket;
    acc[bucket].amount += itemCost(item, pkg.guestCount);
    acc[bucket].count += 1;
  }
  return acc;
}

export function computeBudget(
  total: number,
  targets: Record<string, number>,
  spend: Record<BucketId, BucketSpend>,
): BucketResult[] {
  return BUCKETS.map((bucket) => {
    const recommended = bucketTarget(total, bucket.pct, targets[bucket.id]);
    const { amount: allocated, count } = spend[bucket.id] ?? { amount: 0, count: 0 };

    let status: BucketResult["status"] = "under";
    if (recommended > 0) {
      if (allocated > recommended) status = "over";
      else if (allocated >= recommended * 0.9) status = "near";
    } else if (allocated > 0) {
      status = "over";
    }

    return {
      id: bucket.id,
      label: bucket.label,
      pct: bucket.pct,
      pctRange: bucket.pctRange,
      recommended,
      allocated,
      vendorCount: count,
      status,
    };
  });
}

export interface BudgetTotals {
  total: number;
  /** Cost of the selected package (what you plan to spend). */
  allocated: number;
  remaining: number;
  /** Sum of every section's target — lets the user see if the split adds up. */
  targetsSum: number;
}

export function budgetTotals(
  total: number,
  targets: Record<string, number>,
  pkg: WeddingPackage | null,
): BudgetTotals {
  const allocated = pkg ? packageTotal(pkg) : 0;
  const targetsSum = BUCKETS.reduce((sum, b) => sum + bucketTarget(total, b.pct, targets[b.id]), 0);
  return {
    total,
    allocated,
    remaining: total - allocated,
    targetsSum,
  };
}
