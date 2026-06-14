import { listGifts } from "@/lib/gifts";
import GiftList from "@/components/GiftList";

export const dynamic = "force-dynamic";

export default async function GiftsPage() {
  const gifts = await listGifts();
  return <GiftList gifts={gifts} />;
}
