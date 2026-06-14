"use client";

import { CATEGORIES } from "@/lib/categories";
import { formatCurrency, itemCost, packageTotal } from "@/lib/format";
import type { Category, WeddingPackage } from "@/types";

export default function PackageCompareTable({
  packages,
  onRemove,
}: {
  packages: WeddingPackage[];
  onRemove: (id: string) => void;
}) {
  // Union of categories present across the compared packages, in canonical order.
  const present = new Set<Category>(packages.flatMap((p) => p.items.map((it) => it.category)));
  const categories = CATEGORIES.filter((c) => present.has(c.id));

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-50" />
            {packages.map((p) => (
              <th key={p._id} className="min-w-[10rem] p-2 align-top">
                <div className="rounded-xl border border-gray-200 bg-white p-2 text-left">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-2xl">🎁</span>
                    <button
                      type="button"
                      onClick={() => onRemove(p._id!)}
                      className="text-xs text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 font-semibold leading-tight text-gray-900">{p.name}</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="align-top">
          <Row
            label="Total"
            packages={packages}
            render={(p) => (
              <span className="font-semibold text-brand-700">{formatCurrency(packageTotal(p))}</span>
            )}
          />
          <Row label="Guests" packages={packages} render={(p) => (p.guestCount != null ? p.guestCount : "—")} />
          <Row label="Vendors" packages={packages} render={(p) => p.items.length} />
          {categories.map((c) => (
            <Row
              key={c.id}
              label={`${c.icon} ${c.label}`}
              packages={packages}
              render={(p) => {
                const matches = p.items.filter((it) => it.category === c.id);
                if (!matches.length) return "—";
                return (
                  <ul className="space-y-1.5">
                    {matches.map((it, i) => (
                      <li key={`${it.vendorId}-${i}`}>
                        <span className="font-medium">{it.vendorName}</span>
                        <br />
                        <span className="text-xs text-gray-500">{it.tierName ?? "Est. cost"}</span>
                        <br />
                        <span className="text-brand-700">
                          {formatCurrency(itemCost(it, p.guestCount))}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
          ))}
          <Row label="Notes" packages={packages} render={(p) => p.notes || "—"} />
        </tbody>
      </table>
    </div>
  );
}

function Row({
  label,
  packages,
  render,
}: {
  label: string;
  packages: WeddingPackage[];
  render: (p: WeddingPackage) => React.ReactNode;
}) {
  return (
    <tr className="border-t border-gray-100">
      <td className="sticky left-0 z-10 whitespace-nowrap bg-gray-50 py-3 pr-3 text-xs font-semibold text-gray-500">
        {label}
      </td>
      {packages.map((p) => (
        <td key={p._id} className="p-2 text-gray-800">
          {render(p)}
        </td>
      ))}
    </tr>
  );
}
