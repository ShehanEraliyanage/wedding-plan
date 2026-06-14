import Link from "next/link";
import { formatCurrency, giftsMoneyTotal } from "@/lib/format";
import type { Gift } from "@/types";
import DeleteGiftButton from "@/components/DeleteGiftButton";
import EmptyState from "@/components/EmptyState";

export default function GiftList({ gifts }: { gifts: Gift[] }) {
  const moneyTotal = giftsMoneyTotal(gifts);
  const cashCount = gifts.filter((g) => g.amount != null).length;
  const itemCount = gifts.filter((g) => g.item).length;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gifts</h1>
        <Link href="/gifts/new" className="text-sm font-semibold text-brand-600">
          + Add
        </Link>
      </div>

      {gifts.length === 0 ? (
        <EmptyState
          icon="💝"
          title="No gifts yet"
          message="Record cash and gift items as guests give them — the money total flows to your Home summary."
          actionHref="/gifts/new"
          actionLabel="Add a gift"
        />
      ) : (
        <>
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Total money received</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(moneyTotal)}</p>
            <p className="mt-1 text-xs text-gray-400">
              from {cashCount} cash gift{cashCount === 1 ? "" : "s"}
              {itemCount > 0 && ` · ${itemCount} item gift${itemCount === 1 ? "" : "s"}`}
            </p>
          </section>

          <div className="space-y-2.5">
            {gifts.map((g) => (
              <GiftCard key={g._id} gift={g} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GiftCard({ gift }: { gift: Gift }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
      <Link href={`/gifts/${gift._id}/edit`} className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-gray-900">{gift.guestName}</h3>
          {gift.amount != null && (
            <span className="whitespace-nowrap font-semibold text-emerald-600">
              {formatCurrency(gift.amount)}
            </span>
          )}
        </div>
        {gift.item && <p className="mt-0.5 truncate text-sm text-gray-600">🎁 {gift.item}</p>}
        {gift.notes && <p className="mt-0.5 truncate text-xs text-gray-400">{gift.notes}</p>}
      </Link>
      <DeleteGiftButton id={gift._id!} guestName={gift.guestName} />
    </div>
  );
}
