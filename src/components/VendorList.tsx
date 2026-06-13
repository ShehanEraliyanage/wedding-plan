"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { useCompareIds } from "@/lib/hooks";
import type { Category, VendorSlim } from "@/types";
import VendorCard from "@/components/VendorCard";
import EmptyState from "@/components/EmptyState";

export default function VendorList({ vendors }: { vendors: VendorSlim[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const compareCount = useCompareIds().length;

  // Only offer category filters that actually have vendors.
  const presentCategories = useMemo(() => {
    const set = new Set(vendors.map((v) => v.category));
    return CATEGORIES.filter((c) => set.has(c.id));
  }, [vendors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        (v.location ?? "").toLowerCase().includes(q) ||
        (v.contactPerson ?? "").toLowerCase().includes(q)
      );
    });
  }, [vendors, query, category]);

  if (!vendors.length) {
    return (
      <div className="space-y-4">
        <Header count={0} />
        <EmptyState
          icon="💍"
          title="No vendors yet"
          message="Tap Add to capture your first vendor — snap their price sheet and jot the packages."
          actionHref="/vendors/new"
          actionLabel="Add a vendor"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header count={vendors.length} />

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, location…"
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          All
        </FilterChip>
        {presentCategories.map((c) => (
          <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.icon} {c.label}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No vendors match your search.</p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((v) => (
            <VendorCard key={v._id} vendor={v} />
          ))}
        </div>
      )}

      {compareCount >= 2 && (
        <Link
          href="/compare"
          className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          Compare {compareCount} →
        </Link>
      )}
    </div>
  );
}

function Header({ count }: { count: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
      {count > 0 && <span className="text-sm text-gray-400">{count} saved</span>}
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
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium ${
        active ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
