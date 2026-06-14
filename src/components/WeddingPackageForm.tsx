"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, packageTotal } from "@/lib/format";
import type { WeddingPackage, WeddingPackageItem } from "@/types";
import PackageBuilder from "@/components/PackageBuilder";

interface FormState {
  name: string;
  guestCount: string;
  notes: string;
  items: WeddingPackageItem[];
}

const EMPTY: FormState = { name: "", guestCount: "", notes: "", items: [] };

const DRAFT_KEY = "wp.draft.package.new";

function fromPackage(p: WeddingPackage): FormState {
  return {
    name: p.name,
    guestCount: p.guestCount != null ? String(p.guestCount) : "",
    notes: p.notes ?? "",
    items: p.items ?? [],
  };
}

export default function WeddingPackageForm({
  mode,
  weddingPackage,
}: {
  mode: "create" | "edit";
  weddingPackage?: WeddingPackage;
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(weddingPackage ? fromPackage(weddingPackage) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftLoaded = useRef(false);

  // Restore an in-progress draft (create mode only).
  useEffect(() => {
    if (mode !== "create" || draftLoaded.current) return;
    draftLoaded.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
  }, [mode]);

  // Autosave draft.
  useEffect(() => {
    if (mode !== "create" || !draftLoaded.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, mode]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const guestCountNum = state.guestCount ? Number(state.guestCount) : undefined;
  const total = packageTotal({ items: state.items, guestCount: guestCountNum });
  const hasPerPax = state.items.some((it) => it.priceType === "per_pax");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!state.name.trim()) return setError("Please enter a name.");

    setSaving(true);
    const payload = {
      name: state.name,
      guestCount: state.guestCount ? Number(state.guestCount) : undefined,
      notes: state.notes,
      items: state.items,
    };

    try {
      const url = mode === "create" ? "/api/packages" : `/api/packages/${weddingPackage!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      const saved: WeddingPackage = await res.json();
      if (mode === "create") localStorage.removeItem(DRAFT_KEY);
      router.push(`/packages/${saved._id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed. Your data is kept — try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">
        {mode === "create" ? "Build a package" : "Edit package"}
      </h1>

      {/* Name */}
      <section>
        <Label>Name *</Label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Plan A — Grand Ballroom"
          className={inputCls}
          autoFocus={mode === "create"}
        />
      </section>

      {/* Guest count */}
      <section>
        <Label>Guest count</Label>
        <input
          type="number"
          inputMode="numeric"
          value={state.guestCount}
          onChange={(e) => set("guestCount", e.target.value)}
          placeholder="e.g. 250"
          className={inputCls}
        />
        {hasPerPax && !guestCountNum && (
          <p className="mt-1 text-xs font-medium text-amber-600">
            Set a guest count so per-pax tiers are costed.
          </p>
        )}
      </section>

      {/* Vendors */}
      <section>
        <Label>Vendors in this package</Label>
        <PackageBuilder
          items={state.items}
          guestCount={guestCountNum}
          onChange={(items) => set("items", items)}
        />
      </section>

      {/* Notes */}
      <section>
        <Label>Notes</Label>
        <textarea
          value={state.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Anything to remember…"
          rows={3}
          className={inputCls}
        />
      </section>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {/* Sticky save bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-screen-sm border-t border-gray-200 bg-white px-4 py-3">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xs text-gray-500">Total</span>
          <span className="text-base font-bold text-gray-900">{formatCurrency(total)}</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Save package" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-gray-700">{children}</label>;
}
