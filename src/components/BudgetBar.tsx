import { formatCurrency } from "@/lib/format";
import type { BucketResult } from "@/types";

const STATUS_BAR: Record<BucketResult["status"], string> = {
  under: "bg-emerald-500",
  near: "bg-amber-500",
  over: "bg-red-500",
};

export default function BudgetBar({ bucket }: { bucket: BucketResult }) {
  const pct =
    bucket.recommended > 0 ? Math.min(100, (bucket.allocated / bucket.recommended) * 100) : 0;
  const over = bucket.status === "over";
  const diff = bucket.allocated - bucket.recommended;

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
        </div>
        <span className="text-xs text-gray-400">
          {bucket.vendorCount} vendor{bucket.vendorCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${STATUS_BAR[bucket.status]}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="font-medium text-gray-900">{formatCurrency(bucket.allocated)}</span>
        <span className="text-gray-400">of {formatCurrency(bucket.recommended)}</span>
      </div>

      {bucket.recommended > 0 && (
        <p className={`mt-0.5 text-xs ${over ? "text-red-600" : "text-gray-400"}`}>
          {over ? `Over by ${formatCurrency(diff)}` : `${formatCurrency(-diff)} left`}
        </p>
      )}
    </div>
  );
}
