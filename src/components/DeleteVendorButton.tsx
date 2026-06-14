"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeCompare } from "@/lib/compareStore";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteVendorButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      removeCompare(id);
      toast.success("Vendor deleted");
      router.push("/");
      router.refresh();
    } catch {
      setDeleting(false);
      setOpen(false);
      toast.error("Could not delete. Please try again.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
      >
        Delete
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this vendor?"
        message="This can't be undone."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
