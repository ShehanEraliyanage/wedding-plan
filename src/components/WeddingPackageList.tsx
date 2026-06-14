"use client";

import Link from "next/link";
import { usePackageCompareIds } from "@/lib/hooks";
import type { WeddingPackage } from "@/types";
import WeddingPackageCard from "@/components/WeddingPackageCard";
import EmptyState from "@/components/EmptyState";

export default function WeddingPackageList({ packages }: { packages: WeddingPackage[] }) {
  const compareCount = usePackageCompareIds().length;

  if (!packages.length) {
    return (
      <div className="space-y-4">
        <Header count={0} />
        <EmptyState
          icon="🎁"
          title="No packages yet"
          message="Bundle your favourite vendors — a venue, photographer, makeup and more — into a complete plan you can price and compare."
          actionHref="/packages/new"
          actionLabel="Build a package"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header count={packages.length} />

      <div className="space-y-2.5">
        {packages.map((p) => (
          <WeddingPackageCard key={p._id} weddingPackage={p} />
        ))}
      </div>

      {compareCount >= 2 && (
        <Link
          href="/packages/compare"
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
      <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
      {count > 0 && <span className="text-sm text-gray-400">{count} saved</span>}
    </div>
  );
}
