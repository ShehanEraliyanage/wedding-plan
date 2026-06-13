import { listVendors } from "@/lib/vendors";
import VendorList from "@/components/VendorList";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const vendors = await listVendors(undefined, true);
  return <VendorList vendors={vendors} />;
}
