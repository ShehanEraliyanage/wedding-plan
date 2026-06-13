import type { Package, PriceType } from "@/types";

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
