"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Gift } from "@/types";

interface FormState {
  guestName: string;
  amount: string;
  item: string;
  notes: string;
}

function fromGift(g: Gift): FormState {
  return {
    guestName: g.guestName,
    amount: g.amount != null ? String(g.amount) : "",
    item: g.item ?? "",
    notes: g.notes ?? "",
  };
}

const EMPTY: FormState = { guestName: "", amount: "", item: "", notes: "" };

export default function GiftForm({ mode, gift }: { mode: "create" | "edit"; gift?: Gift }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(gift ? fromGift(gift) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!state.guestName.trim()) return setError("Please enter the guest's name.");
    if (!state.amount && !state.item.trim()) {
      return setError("Add an amount, a gift item, or both.");
    }

    setSaving(true);
    const payload = {
      guestName: state.guestName,
      amount: state.amount ? Number(state.amount) : undefined,
      item: state.item,
      notes: state.notes,
    };

    try {
      const url = mode === "create" ? "/api/gifts" : `/api/gifts/${gift!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      toast.success(mode === "create" ? "Gift added" : "Changes saved");
      router.push("/gifts");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed. Try again.";
      setError(message);
      toast.error(message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">
        {mode === "create" ? "Add gift" : "Edit gift"}
      </h1>

      <section>
        <Label>Guest name *</Label>
        <input
          type="text"
          value={state.guestName}
          onChange={(e) => set("guestName", e.target.value)}
          placeholder="Who gave it"
          className={inputCls}
          autoFocus={mode === "create"}
        />
      </section>

      <section>
        <Label>Amount received</Label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-400">Rs</span>
          <input
            type="number"
            inputMode="numeric"
            value={state.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="e.g. 10000"
            className={inputCls}
          />
        </div>
      </section>

      <section>
        <Label>Gift item</Label>
        <input
          type="text"
          value={state.item}
          onChange={(e) => set("item", e.target.value)}
          placeholder="e.g. Dinner set, toaster…"
          className={inputCls}
        />
      </section>

      <section>
        <Label>Notes</Label>
        <textarea
          value={state.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Thank-you sent? Anything to remember…"
          rows={3}
          className={inputCls}
        />
      </section>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

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
            {saving ? "Saving…" : mode === "create" ? "Save gift" : "Save changes"}
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
