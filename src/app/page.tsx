import { listVendors } from "@/lib/vendors";
import VendorList from "@/components/VendorList";
import HomeSummary from "@/components/HomeSummary";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const vendors = await listVendors(undefined, true);
  return (
    <div className="space-y-4">
      <HomeSummary />
      <VendorList vendors={vendors} />
    </div>
  );
}
