import { NextResponse } from "next/server";
import { createVendor, listVendors, sanitizeVendorInput } from "@/lib/vendors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const slim = searchParams.get("slim") === "1";
    const vendors = slim ? await listVendors(category, true) : await listVendors(category);
    return NextResponse.json(vendors);
  } catch (err) {
    console.error("GET /api/vendors", err);
    return NextResponse.json({ error: "Could not load vendors" }, { status: 500 });
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
    const input = sanitizeVendorInput(body);
    const vendor = await createVendor(input);
    return NextResponse.json(vendor, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create vendor";
    const isValidation = /required|invalid/i.test(message);
    if (!isValidation) console.error("POST /api/vendors", err);
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}
