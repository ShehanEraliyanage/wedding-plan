import { notFound } from "next/navigation";
import { getGift } from "@/lib/gifts";
import GiftForm from "@/components/GiftForm";

export const dynamic = "force-dynamic";

export default async function EditGiftPage({ params }: { params: { id: string } }) {
  const gift = await getGift(params.id);
  if (!gift) notFound();
  return <GiftForm mode="edit" gift={gift} />;
}
