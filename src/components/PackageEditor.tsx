"use client";

import type { Package, PriceType } from "@/types";
import { priceTypeLabel } from "@/lib/format";

const PRICE_TYPES: PriceType[] = ["per_pax", "total", "per_day"];

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `pkg_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export default function PackageEditor({
  packages,
  onChange,
}: {
  packages: Package[];
  onChange: (packages: Package[]) => void;
}) {
  function update(id: string, patch: Partial<Package>) {
    onChange(packages.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function add() {
    onChange([...packages, { id: newId(), name: "", price: 0, priceType: "per_pax", includes: [] }]);
  }
  function remove(id: string) {
    onChange(packages.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-3">
      {packages.map((pkg, i) => (
        <div key={pkg.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Tier {i + 1}</span>
            <button
              type="button"
              onClick={() => remove(pkg.id)}
              className="text-xs font-medium text-red-500"
            >
              Remove
            </button>
          </div>

          <input
            type="text"
            value={pkg.name}
            onChange={(e) => update(pkg.id, { name: e.target.value })}
            placeholder="Name (e.g. Gold, Per plate)"
            className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
          />

          <div className="mb-2 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={pkg.price || ""}
              onChange={(e) => update(pkg.id, { price: Number(e.target.value) || 0 })}
              placeholder="Price"
              className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-base"
            />
            <input
              type="number"
              inputMode="numeric"
              value={pkg.minGuests ?? ""}
              onChange={(e) =>
                update(pkg.id, { minGuests: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="Min guests"
              className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-base"
            />
          </div>

          <div className="mb-2 grid grid-cols-3 gap-1">
            {PRICE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update(pkg.id, { priceType: t })}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium capitalize ${
                  pkg.priceType === t
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-300 bg-white text-gray-600"
                }`}
              >
                {priceTypeLabel(t)}
              </button>
            ))}
          </div>

          <textarea
            value={(pkg.includes ?? []).join("\n")}
            onChange={(e) => update(pkg.id, { includes: e.target.value.split("\n") })}
            placeholder="What's included (one item per line)"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600"
      >
        + Add pricing tier
      </button>
    </div>
  );
}
