import { NextResponse } from "next/server";
import { deleteVendor, getVendor, sanitizeVendorInput, updateVendor } from "@/lib/vendors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const vendor = await getVendor(params.id);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    return NextResponse.json(vendor);
  } catch (err) {
    console.error("GET /api/vendors/[id]", err);
    return NextResponse.json({ error: "Could not load vendor" }, { status: 500 });
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
    const input = sanitizeVendorInput(body);
    const vendor = await updateVendor(params.id, input);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    return NextResponse.json(vendor);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update vendor";
    const isValidation = /required|invalid/i.test(message);
    if (!isValidation) console.error("PUT /api/vendors/[id]", err);
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ok = await deleteVendor(params.id);
    if (!ok) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/vendors/[id]", err);
    return NextResponse.json({ error: "Could not delete vendor" }, { status: 500 });
  }
}
