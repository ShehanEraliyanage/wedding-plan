import Link from "next/link";
import { notFound } from "next/navigation";
import { getVendor } from "@/lib/vendors";
import { formatCurrency } from "@/lib/format";
import CategoryChip from "@/components/CategoryChip";
import PackageList from "@/components/PackageList";
import PhotoViewer from "@/components/PhotoViewer";
import StarRating from "@/components/StarRating";
import DeleteVendorButton from "@/components/DeleteVendorButton";

export const dynamic = "force-dynamic";

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const vendor = await getVendor(params.id);
  if (!vendor) notFound();

  const hasContact = vendor.phone || vendor.email || vendor.website || vendor.location;

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-gray-500">
        ← All vendors
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <CategoryChip category={vendor.category} />
          {vendor.rating ? <StarRating value={vendor.rating} size="sm" /> : null}
        </div>
      </header>

      {vendor.photos.length > 0 && (
        <section>
          <PhotoViewer photos={vendor.photos} />
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Pricing tiers
        </h2>
        <PackageList packages={vendor.packages} />
      </section>

      {vendor.estimatedCost != null && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <span className="text-sm text-gray-500">Estimated cost</span>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(vendor.estimatedCost)}</p>
        </section>
      )}

      {hasContact && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">Contact</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {vendor.contactPerson && <Info label="Person" value={vendor.contactPerson} />}
            {vendor.phone && (
              <Info label="Phone" value={vendor.phone} href={`tel:${vendor.phone}`} />
            )}
            {vendor.email && (
              <Info label="Email" value={vendor.email} href={`mailto:${vendor.email}`} />
            )}
            {vendor.website && (
              <Info
                label="Website"
                value={vendor.website}
                href={normalizeUrl(vendor.website)}
                external
              />
            )}
            {vendor.location && <Info label="Location" value={vendor.location} />}
          </div>
        </section>
      )}

      {vendor.notes && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">Notes</h2>
          <p className="whitespace-pre-wrap rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            {vendor.notes}
          </p>
        </section>
      )}

      <div className="flex gap-3">
        <Link
          href={`/vendors/${vendor._id}/edit`}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
        >
          Edit
        </Link>
        <DeleteVendorButton id={vendor._id!} />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  href,
  external,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      {href ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="truncate text-sm font-medium text-brand-700 underline"
        >
          {value}
        </a>
      ) : (
        <span className="truncate text-sm font-medium text-gray-900">{value}</span>
      )}
    </div>
  );
}
