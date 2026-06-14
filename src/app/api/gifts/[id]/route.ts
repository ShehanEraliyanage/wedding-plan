import { NextResponse } from "next/server";
import { deleteGift, getGift, sanitizeGiftInput, updateGift } from "@/lib/gifts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const gift = await getGift(params.id);
    if (!gift) return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    return NextResponse.json(gift);
  } catch (err) {
    console.error("GET /api/gifts/[id]", err);
    return NextResponse.json({ error: "Could not load gift" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const input = sanitizeGiftInput(body);
    const gift = await updateGift(params.id, input);
    if (!gift) return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    return NextResponse.json(gift);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update gift";
    const isValidation = /required|invalid/i.test(message);
    if (!isValidation) console.error("PUT /api/gifts/[id]", err);
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ok = await deleteGift(params.id);
    if (!ok) return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/gifts/[id]", err);
    return NextResponse.json({ error: "Could not delete gift" }, { status: 500 });
  }
}
