"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBudgetPackageId } from "@/lib/hooks";
import { formatCurrency, giftsMoneyTotal, packageTotal } from "@/lib/format";
import type { Gift, WeddingPackage } from "@/types";

export default function HomeSummary() {
  const selectedId = useBudgetPackageId();
  const [planCost, setPlanCost] = useState<number | null>(null);
  const [giftsTotal, setGiftsTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/gifts").then((r) => (r.ok ? r.json() : [])),
      selectedId
        ? fetch(`/api/packages/${selectedId}`).then((r) => (r.ok ? r.json() : null))
        : Promise.resolve(null),
    ])
      .then(([gifts, pkg]: [Gift[], WeddingPackage | null]) => {
        if (cancelled) return;
        setGiftsTotal(giftsMoneyTotal(gifts));
        setPlanCost(pkg ? packageTotal(pkg) : null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Nothing meaningful to show yet — stay out of the way.
  if (!loaded || (planCost == null && giftsTotal === 0)) return null;

  const net = giftsTotal - (planCost ?? 0);
  const netGood = net >= 0;

  return (
    <Link
      href="/gifts"
      className="block rounded-2xl border border-gray-200 bg-white p-4"
      aria-label="Money summary — open gifts"
    >
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat
          label="Wedding cost"
          value={planCost == null ? "—" : formatCurrency(planCost)}
        />
        <Stat label="Gifts received" value={formatCurrency(giftsTotal)} tone="good" />
        <Stat
          label={netGood ? "Net gain" : "Net cost"}
          value={formatCurrency(Math.abs(net))}
          tone={netGood ? "good" : "bad"}
        />
      </div>
      {planCost == null && (
        <p className="mt-2 text-center text-xs text-gray-400">
          Select a package on the Budget tab to set your wedding cost.
        </p>
      )}
    </Link>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad";
}) {
  const color =
    tone === "bad" ? "text-red-600" : tone === "good" ? "text-emerald-600" : "text-gray-900";
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
