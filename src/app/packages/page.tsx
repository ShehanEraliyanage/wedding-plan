import { listWeddingPackages } from "@/lib/packages";
import WeddingPackageList from "@/components/WeddingPackageList";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await listWeddingPackages();
  return <WeddingPackageList packages={packages} />;
}
