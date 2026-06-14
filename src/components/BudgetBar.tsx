"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { BucketResult } from "@/types";

const STATUS_BAR: Record<BucketResult["status"], string> = {
  under: "bg-emerald-500",
  near: "bg-amber-500",
  over: "bg-red-500",
};

export default function BudgetBar({
  bucket,
  total,
  overridden,
  onSetTarget,
  onReset,
}: {
  bucket: BucketResult;
  total: number;
  overridden: boolean;
  onSetTarget: (amount: number) => void;
  onReset: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const pct =
    bucket.recommended > 0 ? Math.min(100, (bucket.allocated / bucket.recommended) * 100) : 0;
  const over = bucket.status === "over";
  const diff = bucket.allocated - bucket.recommended;
  const suggested = total * bucket.pct;

  function startEdit() {
    setDraft(String(Math.round(bucket.recommended)));
    setEditing(true);
  }
  function save() {
    onSetTarget(Number(draft) || 0);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-semibold text-gray-900">{bucket.label}</span>
          <span className="ml-2 text-xs text-gray-400">
            {bucket.pctRange[0] === bucket.pctRange[1]
              ? `${bucket.pctRange[0]}%`
              : `${bucket.pctRange[0]}–${bucket.pctRange[1]}%`}
          </span>
          {overridden && (
            <span className="ml-2 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
              custom
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {bucket.vendorCount} vendor{bucket.vendorCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${STATUS_BAR[bucket.status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">{formatCurrency(bucket.allocated)}</span>

        {editing ? (
          <span className="flex items-center gap-1">
            <span className="text-gray-400">of Rs</span>
            <input
              type="number"
              inputMode="numeric"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-500"
            >
              ✕
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="text-gray-400 underline decoration-dotted underline-offset-2"
          >
            of {formatCurrency(bucket.recommended)} ✎
          </button>
        )}
      </div>

      <div className="mt-0.5 flex items-center justify-between">
        {bucket.recommended > 0 ? (
          <p className={`text-xs ${over ? "text-red-600" : "text-gray-400"}`}>
            {over ? `Over by ${formatCurrency(diff)}` : `${formatCurrency(-diff)} left`}
          </p>
        ) : (
          <span />
        )}
        {overridden && !editing && (
          <button type="button" onClick={onReset} className="text-xs font-medium text-brand-600">
            Reset to {formatCurrency(suggested)}
          </button>
        )}
      </div>
    </div>
  );
}
