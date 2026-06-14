"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removePackageCompare } from "@/lib/packageCompareStore";

export default function DeleteWeddingPackageButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this package? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      removePackageCompare(id);
      router.push("/packages");
      router.refresh();
    } catch {
      setDeleting(false);
      window.alert("Could not delete. Please try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
