"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import type { Category, Package, Vendor } from "@/types";
import PhotoCapture from "@/components/PhotoCapture";
import PackageEditor from "@/components/PackageEditor";
import StarRating from "@/components/StarRating";

interface FormState {
  name: string;
  category: Category | "";
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  rating?: number;
  notes: string;
  estimatedCost: string;
  photos: string[];
  packages: Package[];
}

const EMPTY: FormState = {
  name: "",
  category: "",
  contactPerson: "",
  phone: "",
  email: "",
  website: "",
  location: "",
  rating: undefined,
  notes: "",
  estimatedCost: "",
  photos: [],
  packages: [],
};

const DRAFT_KEY = "wp.draft.new";

function fromVendor(v: Vendor): FormState {
  return {
    name: v.name,
    category: v.category,
    contactPerson: v.contactPerson ?? "",
    phone: v.phone ?? "",
    email: v.email ?? "",
    website: v.website ?? "",
    location: v.location ?? "",
    rating: v.rating,
    notes: v.notes ?? "",
    estimatedCost: v.estimatedCost != null ? String(v.estimatedCost) : "",
    photos: v.photos ?? [],
    packages: v.packages ?? [],
  };
}

export default function VendorForm({ mode, vendor }: { mode: "create" | "edit"; vendor?: Vendor }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(vendor ? fromVendor(vendor) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftLoaded = useRef(false);

  // Restore an in-progress draft (create mode only; photos are not drafted).
  useEffect(() => {
    if (mode !== "create" || draftLoaded.current) return;
    draftLoaded.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw), photos: s.photos }));
    } catch {
      /* ignore */
    }
  }, [mode]);

  // Autosave draft (minus photos, to stay under the localStorage quota).
  useEffect(() => {
    if (mode !== "create" || !draftLoaded.current) return;
    try {
      const { photos, ...rest } = state;
      void photos;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }, [state, mode]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!state.name.trim()) return setError("Please enter a name.");
    if (!state.category) return setError("Please pick a category.");

    setSaving(true);
    const payload = {
      ...state,
      estimatedCost: state.estimatedCost ? Number(state.estimatedCost) : undefined,
    };

    try {
      const url = mode === "create" ? "/api/vendors" : `/api/vendors/${vendor!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      const saved: Vendor = await res.json();
      if (mode === "create") localStorage.removeItem(DRAFT_KEY);
      router.push(`/vendors/${saved._id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed. Your data is kept — try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">
        {mode === "create" ? "Add vendor" : "Edit vendor"}
      </h1>

      {/* Category */}
      <section>
        <Label>Category *</Label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set("category", c.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-xs font-medium ${
                state.category === c.id
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              <span className="text-lg leading-none">{c.icon}</span>
              <span className="text-center leading-tight">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Name */}
      <section>
        <Label>Name *</Label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Vendor / company name"
          className={inputCls}
          autoFocus={mode === "create"}
        />
      </section>

      {/* Photos */}
      <section>
        <Label>Photos (brochures, price sheets, samples)</Label>
        <PhotoCapture photos={state.photos} onChange={(p) => set("photos", p)} />
      </section>

      {/* Packages */}
      <section>
        <Label>Packages &amp; prices</Label>
        <PackageEditor packages={state.packages} onChange={(p) => set("packages", p)} />
      </section>

      {/* Contact */}
      <section className="space-y-2">
        <Label>Contact</Label>
        <input
          type="text"
          value={state.contactPerson}
          onChange={(e) => set("contactPerson", e.target.value)}
          placeholder="Contact person"
          className={inputCls}
        />
        <input
          type="tel"
          inputMode="tel"
          value={state.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="Phone"
          className={inputCls}
        />
        <input
          type="email"
          inputMode="email"
          value={state.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="Email"
          className={inputCls}
        />
        <input
          type="url"
          inputMode="url"
          value={state.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="Website / Instagram"
          className={inputCls}
        />
        <input
          type="text"
          value={state.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Location"
          className={inputCls}
        />
      </section>

      {/* Budget + rating */}
      <section>
        <Label>Estimated cost (for budget)</Label>
        <input
          type="number"
          inputMode="numeric"
          value={state.estimatedCost}
          onChange={(e) => set("estimatedCost", e.target.value)}
          placeholder="e.g. 850000"
          className={inputCls}
        />
      </section>

      <section>
        <Label>Your rating</Label>
        <StarRating value={state.rating} onChange={(r) => set("rating", r)} />
      </section>

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
            {saving ? "Saving…" : mode === "create" ? "Save vendor" : "Save changes"}
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
