import type { Gift, Package, PriceType, WeddingPackage, WeddingPackageItem } from "@/types";

const fmt = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

/** Rs 1,250,000 */
export function formatCurrency(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  // "LKR 1,250,000" -> "Rs 1,250,000" reads cleaner locally.
  return fmt.format(value).replace("LKR", "Rs");
}

const PRICE_TYPE_SUFFIX: Record<PriceType, string> = {
  per_pax: "/ pax",
  total: "total",
  per_day: "/ day",
};

export function priceTypeLabel(type: PriceType): string {
  return PRICE_TYPE_SUFFIX[type];
}

/** "Rs 4,500 / pax" */
export function packagePriceLabel(pkg: Package): string {
  return `${formatCurrency(pkg.price)} ${PRICE_TYPE_SUFFIX[pkg.priceType]}`;
}

/** The cheapest package on a vendor, or undefined if none. */
export function cheapestPackage(packages: Package[]): Package | undefined {
  if (!packages.length) return undefined;
  return packages.reduce((min, p) => (p.price < min.price ? p : min));
}

// ---- wedding-package (bundle) cost math ----
// per_pax → price × guestCount; total & per_day → flat price.

/** Cost of one package item given the bundle's guest count. */
export function itemCost(item: WeddingPackageItem, guestCount?: number): number {
  if (item.priceType === "per_pax") return item.price * (guestCount ?? 0);
  return item.price;
}

/** Total cost of a wedding package (sum of all item costs). */
export function packageTotal(pkg: Pick<WeddingPackage, "items" | "guestCount">): number {
  return pkg.items.reduce((sum, it) => sum + itemCost(it, pkg.guestCount), 0);
}

/** Total cash received across a list of gifts. */
export function giftsMoneyTotal(gifts: Pick<Gift, "amount">[]): number {
  return gifts.reduce((sum, g) => sum + (g.amount ?? 0), 0);
}
