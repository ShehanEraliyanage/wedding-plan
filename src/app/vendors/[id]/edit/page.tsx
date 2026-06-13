import { notFound } from "next/navigation";
import { getVendor } from "@/lib/vendors";
import VendorForm from "@/components/VendorForm";

export const dynamic = "force-dynamic";

export default async function EditVendorPage({ params }: { params: { id: string } }) {
  const vendor = await getVendor(params.id);
  if (!vendor) notFound();
  return <VendorForm mode="edit" vendor={vendor} />;
}
