import { NextResponse } from "next/server";
import {
  deleteWeddingPackage,
  getWeddingPackage,
  sanitizeWeddingPackageInput,
  updateWeddingPackage,
} from "@/lib/packages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const pkg = await getWeddingPackage(params.id);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(pkg);
  } catch (err) {
    console.error("GET /api/packages/[id]", err);
    return NextResponse.json({ error: "Could not load package" }, { status: 500 });
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
    const input = sanitizeWeddingPackageInput(body);
    const pkg = await updateWeddingPackage(params.id, input);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(pkg);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update package";
    const isValidation = /required|invalid/i.test(message);
    if (!isValidation) console.error("PUT /api/packages/[id]", err);
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ok = await deleteWeddingPackage(params.id);
    if (!ok) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/packages/[id]", err);
    return NextResponse.json({ error: "Could not delete package" }, { status: 500 });
  }
}
