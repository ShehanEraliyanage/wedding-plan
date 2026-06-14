import { NextResponse } from "next/server";
import { createGift, listGifts, sanitizeGiftInput } from "@/lib/gifts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const gifts = await listGifts();
    return NextResponse.json(gifts);
  } catch (err) {
    console.error("GET /api/gifts", err);
    return NextResponse.json({ error: "Could not load gifts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const input = sanitizeGiftInput(body);
    const gift = await createGift(input);
    return NextResponse.json(gift, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create gift";
    const isValidation = /required|invalid/i.test(message);
    if (!isValidation) console.error("POST /api/gifts", err);
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}
