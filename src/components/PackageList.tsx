import type { Package } from "@/types";
import { packagePriceLabel } from "@/lib/format";

export default function PackageList({ packages }: { packages: Package[] }) {
  if (!packages.length) {
    return <p className="text-sm text-gray-400">No pricing tiers recorded.</p>;
  }

  return (
    <div className="space-y-2">
      {packages.map((pkg) => (
        <div key={pkg.id} className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium text-gray-900">{pkg.name}</span>
            <span className="whitespace-nowrap font-semibold text-brand-700">
              {packagePriceLabel(pkg)}
            </span>
          </div>
          {pkg.minGuests ? (
            <p className="mt-0.5 text-xs text-gray-500">Min {pkg.minGuests} guests</p>
          ) : null}
          {pkg.includes && pkg.includes.length > 0 && (
            <ul className="mt-1.5 list-inside list-disc text-sm text-gray-600">
              {pkg.includes.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
