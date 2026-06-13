import { categoryMeta } from "@/lib/categories";
import type { BucketId, BucketResult, Vendor, VendorSlim } from "@/types";

interface BucketDef {
  id: BucketId;
  label: string;
  pct: number;
  pctRange: [number, number];
}

// Midpoints of the user's planning guide split.
export const BUCKETS: BucketDef[] = [
  { id: "venueFood", label: "Venue + Food", pct: 0.45, pctRange: [40, 50] },
  { id: "photoVideo", label: "Photo + Video", pct: 0.225, pctRange: [20, 25] },
  { id: "makeupDressing", label: "Makeup + Dressing", pct: 0.125, pctRange: [10, 15] },
  { id: "decor", label: "Decor", pct: 0.1, pctRange: [10, 10] },
  { id: "cakeExtras", label: "Cake + Extras", pct: 0.075, pctRange: [5, 10] },
];

type BudgetVendor = Pick<Vendor | VendorSlim, "category" | "estimatedCost">;

export function computeBudget(total: number, vendors: BudgetVendor[]): BucketResult[] {
  return BUCKETS.map((bucket) => {
    const mapped = vendors.filter(
      (v) => categoryMeta(v.category).bucket === bucket.id && typeof v.estimatedCost === "number",
    );
    const allocated = mapped.reduce((sum, v) => sum + (v.estimatedCost ?? 0), 0);
    const recommended = total * bucket.pct;

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
      vendorCount: mapped.length,
      status,
    };
  });
}

export interface BudgetTotals {
  total: number;
  allocated: number;
  remaining: number;
  unbudgetedCount: number;
}

export function budgetTotals(total: number, vendors: BudgetVendor[]): BudgetTotals {
  const allocated = vendors.reduce((sum, v) => sum + (v.estimatedCost ?? 0), 0);
  const unbudgetedCount = vendors.filter((v) => typeof v.estimatedCost !== "number").length;
  return {
    total,
    allocated,
    remaining: total - allocated,
    unbudgetedCount,
  };
}
