"use client";

import { useEffect, useState } from "react";
import { useBudgetTotal } from "@/lib/hooks";
import { getBudgetTotal, setBudgetTotal } from "@/lib/compareStore";
import { budgetTotals, computeBudget } from "@/lib/budget";
import { formatCurrency } from "@/lib/format";
import type { VendorSlim } from "@/types";
import BudgetBar from "@/components/BudgetBar";

export default function BudgetPage() {
  const total = useBudgetTotal();
  const [vendors, setVendors] = useState<VendorSlim[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const t = getBudgetTotal();
    setInput(t ? String(t) : "");
    fetch("/api/vendors?slim=1")
      .then((r) => (r.ok ? r.json() : []))
      .then(setVendors)
      .catch(() => setVendors([]));
  }, []);

  const buckets = computeBudget(total, vendors);
  const totals = budgetTotals(total, vendors);
  const remainingOver = totals.remaining < 0;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Budget</h1>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Total wedding budget
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-400">Rs</span>
          <input
            type="number"
            inputMode="numeric"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setBudgetTotal(Number(e.target.value) || 0);
            }}
            placeholder="e.g. 2000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </section>

      {total > 0 && (
        <section className="grid grid-cols-3 gap-2">
          <Stat label="Budget" value={formatCurrency(totals.total)} />
          <Stat label="Earmarked" value={formatCurrency(totals.allocated)} />
          <Stat
            label={remainingOver ? "Over" : "Left"}
            value={formatCurrency(Math.abs(totals.remaining))}
            tone={remainingOver ? "bad" : "good"}
          />
        </section>
      )}

      <section className="space-y-3">
        {buckets.map((b) => (
          <BudgetBar key={b.id} bucket={b} />
        ))}
      </section>

      <p className="text-xs text-gray-400">
        Recommended amounts use your planning split. The “earmarked” figure adds up the{" "}
        <strong>estimated cost</strong> you set on each vendor.
        {totals.unbudgetedCount > 0 &&
          ` ${totals.unbudgetedCount} vendor${totals.unbudgetedCount === 1 ? "" : "s"} have no estimate yet.`}
      </p>
    </div>
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
    <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
