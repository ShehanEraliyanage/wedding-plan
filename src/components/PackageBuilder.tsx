"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, categoryMeta } from "@/lib/categories";
import { cheapestPackage, formatCurrency, itemCost, packagePriceLabel } from "@/lib/format";
import type { Category, VendorSlim, WeddingPackageItem } from "@/types";
import CategoryChip from "@/components/CategoryChip";

const NO_TIER = "__none__";

/** Build a package item snapshot from a vendor + a chosen tier id (or no tier). */
function itemFor(vendor: VendorSlim, tierId: string | undefined): WeddingPackageItem {
  const tier = tierId ? vendor.packages.find((p) => p.id === tierId) : undefined;
  if (tier) {
    return {
      vendorId: vendor._id!,
      tierId: tier.id,
      vendorName: vendor.name,
      category: vendor.category,
      tierName: tier.name,
      price: tier.price,
      priceType: tier.priceType,
    };
  }
  return {
    vendorId: vendor._id!,
    tierId: undefined,
    vendorName: vendor.name,
    category: vendor.category,
    tierName: undefined,
    price: vendor.estimatedCost ?? 0,
    priceType: "total",
  };
}

export default function PackageBuilder({
  items,
  guestCount,
  onChange,
}: {
  items: WeddingPackageItem[];
  guestCount?: number;
  onChange: (items: WeddingPackageItem[]) => void;
}) {
  const [catalog, setCatalog] = useState<VendorSlim[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  // Load the vendor catalog (slim keeps pricing tiers + estimatedCost, drops photos).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/vendors?slim=1")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data: VendorSlim[]) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load vendors.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => {
    const m = new Map<string, VendorSlim>();
    catalog?.forEach((v) => v._id && m.set(v._id, v));
    return m;
  }, [catalog]);

  const presentCategories = useMemo(() => {
    const set = new Set((catalog ?? []).map((v) => v.category));
    return CATEGORIES.filter((c) => set.has(c.id));
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (catalog ?? []).filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q) || (v.location ?? "").toLowerCase().includes(q);
    });
  }, [catalog, query, category]);

  function addVendor(vendor: VendorSlim) {
    const defaultTier = cheapestPackage(vendor.packages);
    onChange([...items, itemFor(vendor, defaultTier?.id)]);
    setPicking(false);
    setQuery("");
    setCategory("all");
  }

  function setTier(index: number, tierId: string | undefined) {
    const vendor = byId.get(items[index].vendorId);
    if (!vendor) return;
    onChange(items.map((it, i) => (i === index ? itemFor(vendor, tierId) : it)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const vendor = byId.get(item.vendorId);
        const tiers = vendor?.packages ?? [];
        return (
          <div key={`${item.vendorId}-${i}`} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{item.vendorName}</p>
                <div className="mt-0.5">
                  <CategoryChip category={item.category} showIcon={false} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-xs font-medium text-red-500"
              >
                Remove
              </button>
            </div>

            <select
              value={item.tierId ?? NO_TIER}
              onChange={(e) => setTier(i, e.target.value === NO_TIER ? undefined : e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base"
            >
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {packagePriceLabel(t)}
                </option>
              ))}
              <option value={NO_TIER}>
                No tier (use est. cost{vendor?.estimatedCost != null ? ` ${formatCurrency(vendor.estimatedCost)}` : ""})
              </option>
            </select>

            <p className="mt-2 text-right text-sm font-semibold text-brand-700">
              {formatCurrency(itemCost(item, guestCount))}
            </p>
          </div>
        );
      })}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {!picking ? (
        <button
          type="button"
          onClick={() => setPicking(true)}
          disabled={!catalog}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 disabled:opacity-60"
        >
          {catalog ? "+ Add vendor" : "Loading vendors…"}
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Pick a vendor</span>
            <button
              type="button"
              onClick={() => setPicking(false)}
              className="text-xs font-medium text-gray-500"
            >
              Close
            </button>
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, location…"
            className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {presentCategories.length > 0 && (
            <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
              <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
                All
              </FilterChip>
              {presentCategories.map((c) => (
                <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.icon} {c.label}
                </FilterChip>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No vendors found.</p>
          ) : (
            <ul className="max-h-72 space-y-1.5 overflow-y-auto">
              {filtered.map((v) => {
                const cheapest = cheapestPackage(v.packages);
                return (
                  <li key={v._id}>
                    <button
                      type="button"
                      onClick={() => addVendor(v)}
                      className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-2 text-left"
                    >
                      <span className="text-xl">{categoryMeta(v.category).icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-gray-900">{v.name}</span>
                        <span className="block text-xs text-brand-700">
                          {cheapest
                            ? `from ${packagePriceLabel(cheapest)}`
                            : v.estimatedCost != null
                              ? `~${formatCurrency(v.estimatedCost)}`
                              : "No price yet"}
                        </span>
                      </span>
                      <span className="text-lg text-brand-600">+</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
        active ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
