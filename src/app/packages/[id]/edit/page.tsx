import { notFound } from "next/navigation";
import { getWeddingPackage } from "@/lib/packages";
import WeddingPackageForm from "@/components/WeddingPackageForm";

export const dynamic = "force-dynamic";

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  const pkg = await getWeddingPackage(params.id);
  if (!pkg) notFound();
  return <WeddingPackageForm mode="edit" weddingPackage={pkg} />;
}
