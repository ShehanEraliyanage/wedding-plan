"use client";

import { categoryMeta } from "@/lib/categories";
import { cheapestPackage, formatCurrency, packagePriceLabel } from "@/lib/format";
import type { Vendor } from "@/types";

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function CompareTable({
  vendors,
  onRemove,
}: {
  vendors: Vendor[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-50" />
            {vendors.map((v) => (
              <th key={v._id} className="min-w-[10rem] p-2 align-top">
                <div className="rounded-xl border border-gray-200 bg-white p-2 text-left">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-2xl">{categoryMeta(v.category).icon}</span>
                    <button
                      type="button"
                      onClick={() => onRemove(v._id!)}
                      className="text-xs text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 font-semibold leading-tight text-gray-900">{v.name}</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="align-top">
          <Row label="Category" vendors={vendors} render={(v) => categoryMeta(v.category).label} />
          <Row
            label="Cheapest"
            vendors={vendors}
            render={(v) => {
              const c = cheapestPackage(v.packages);
              return c ? packagePriceLabel(c) : "—";
            }}
          />
          <Row
            label="Pricing tiers"
            vendors={vendors}
            render={(v) =>
              v.packages.length ? (
                <ul className="space-y-1.5">
                  {v.packages.map((p) => (
                    <li key={p.id}>
                      <span className="font-medium">{p.name}</span>
                      <br />
                      <span className="text-brand-700">{packagePriceLabel(p)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Est. cost"
            vendors={vendors}
            render={(v) => (v.estimatedCost != null ? formatCurrency(v.estimatedCost) : "—")}
          />
          <Row label="Rating" vendors={vendors} render={(v) => (v.rating ? "★".repeat(v.rating) : "—")} />
          <Row
            label="Phone"
            vendors={vendors}
            render={(v) =>
              v.phone ? (
                <a href={`tel:${v.phone}`} className="text-brand-700 underline">
                  {v.phone}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Email"
            vendors={vendors}
            render={(v) =>
              v.email ? (
                <a href={`mailto:${v.email}`} className="text-brand-700 underline">
                  {v.email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Website"
            vendors={vendors}
            render={(v) =>
              v.website ? (
                <a
                  href={normalizeUrl(v.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 underline"
                >
                  {v.website}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row label="Location" vendors={vendors} render={(v) => v.location || "—"} />
          <Row label="Notes" vendors={vendors} render={(v) => v.notes || "—"} />
        </tbody>
      </table>
    </div>
  );
}

function Row({
  label,
  vendors,
  render,
}: {
  label: string;
  vendors: Vendor[];
  render: (v: Vendor) => React.ReactNode;
}) {
  return (
    <tr className="border-t border-gray-100">
      <td className="sticky left-0 z-10 whitespace-nowrap bg-gray-50 py-3 pr-3 text-xs font-semibold text-gray-500">
        {label}
      </td>
      {vendors.map((v) => (
        <td key={v._id} className="p-2 text-gray-800">
          {render(v)}
        </td>
      ))}
    </tr>
  );
}
