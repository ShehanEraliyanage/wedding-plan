"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useBudgetPackageId, useBudgetTargets, useBudgetTotal } from "@/lib/hooks";
import {
  getBudgetTotal,
  resetBudgetTarget,
  setBudgetPackageId,
  setBudgetTarget,
  setBudgetTotal,
} from "@/lib/compareStore";
import { budgetTotals, computeBudget, spendByBucket } from "@/lib/budget";
import { formatCurrency, packageTotal } from "@/lib/format";
import type { WeddingPackage } from "@/types";
import BudgetBar from "@/components/BudgetBar";

export default function BudgetPage() {
  const total = useBudgetTotal();
  const targets = useBudgetTargets();
  const selectedId = useBudgetPackageId();
  const [packages, setPackages] = useState<WeddingPackage[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const t = getBudgetTotal();
    setInput(t ? String(t) : "");
    fetch("/api/packages")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPackages)
      .catch(() => setPackages([]));
  }, []);

  const selected = useMemo(
    () => packages.find((p) => p._id === selectedId) ?? null,
    [packages, selectedId],
  );

  const spend = spendByBucket(selected);
  const buckets = computeBudget(total, targets, spend);
  const totals = budgetTotals(total, targets, selected);
  const remainingOver = totals.remaining < 0;
  const targetsOver = totals.targetsSum > total && total > 0;

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

      {/* Plan to track against */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Plan to track</label>
        {packages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No packages yet.{" "}
            <Link href="/packages/new" className="font-medium text-brand-600 underline">
              Build a package
            </Link>{" "}
            to track real spend per section.
          </p>
        ) : (
          <>
            <select
              value={selectedId}
              onChange={(e) => setBudgetPackageId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">— Select a package —</option>
              {packages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} · {formatCurrency(packageTotal(p))}
                </option>
              ))}
            </select>
            {!selected && (
              <p className="mt-1.5 text-xs text-gray-400">
                Pick a package to see how its cost breaks down across your budget sections.
              </p>
            )}
          </>
        )}
      </section>

      {total > 0 && (
        <section className="grid grid-cols-3 gap-2">
          <Stat label="Budget" value={formatCurrency(totals.total)} />
          <Stat label="Plan cost" value={formatCurrency(totals.allocated)} />
          <Stat
            label={remainingOver ? "Over" : "Left"}
            value={formatCurrency(Math.abs(totals.remaining))}
            tone={remainingOver ? "bad" : "good"}
          />
        </section>
      )}

      {total > 0 && (
        <p className={`-mt-2 text-xs ${targetsOver ? "text-red-600" : "text-gray-400"}`}>
          Sections add up to {formatCurrency(totals.targetsSum)} of {formatCurrency(total)}
          {targetsOver && " — over your total"}.
        </p>
      )}

      <section className="space-y-3">
        {buckets.map((b) => (
          <BudgetBar
            key={b.id}
            bucket={b}
            total={total}
            overridden={typeof targets[b.id] === "number"}
            onSetTarget={(amount) => setBudgetTarget(b.id, amount)}
            onReset={() => resetBudgetTarget(b.id)}
          />
        ))}
      </section>

      <p className="text-xs text-gray-400">
        Each section starts at a recommended share of your total — tap the amount (✎) to set a custom
        target. Spend is taken from your selected package, broken down by category.
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
