"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteGiftButton({ id, guestName }: { id: string; guestName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/gifts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Gift removed");
      router.refresh();
    } catch {
      toast.error("Could not delete. Please try again.");
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete gift from ${guestName}`}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center self-start rounded-full border border-gray-300 text-sm text-gray-400"
      >
        ✕
      </button>
      <ConfirmDialog
        open={open}
        title="Remove this gift?"
        message={`This removes ${guestName}'s entry. This can't be undone.`}
        confirmLabel="Remove"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
