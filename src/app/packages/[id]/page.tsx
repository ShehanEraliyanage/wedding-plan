import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingPackage } from "@/lib/packages";
import { formatCurrency, packageTotal } from "@/lib/format";
import PackageItemList from "@/components/PackageItemList";
import DeleteWeddingPackageButton from "@/components/DeleteWeddingPackageButton";

export const dynamic = "force-dynamic";

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const pkg = await getWeddingPackage(params.id);
  if (!pkg) notFound();

  return (
    <div className="space-y-6">
      <Link href="/packages" className="text-sm font-medium text-gray-500">
        ← All packages
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-gray-900">{pkg.name}</h1>
        <div className="mt-1 text-sm text-gray-500">
          {pkg.items.length} vendor{pkg.items.length === 1 ? "" : "s"}
          {pkg.guestCount != null && ` · 👥 ${pkg.guestCount} guests`}
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Total cost</span>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(packageTotal(pkg))}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">Vendors</h2>
        <PackageItemList items={pkg.items} guestCount={pkg.guestCount} />
      </section>

      {pkg.notes && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">Notes</h2>
          <p className="whitespace-pre-wrap rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            {pkg.notes}
          </p>
        </section>
      )}

      <div className="flex gap-3">
        <Link
          href={`/packages/${pkg._id}/edit`}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
        >
          Edit
        </Link>
        <DeleteWeddingPackageButton id={pkg._id!} />
      </div>
    </div>
  );
}
