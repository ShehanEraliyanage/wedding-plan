import { NextResponse } from "next/server";
import {
  createWeddingPackage,
  listWeddingPackages,
  sanitizeWeddingPackageInput,
} from "@/lib/packages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const packages = await listWeddingPackages();
    return NextResponse.json(packages);
  } catch (err) {
    console.error("GET /api/packages", err);
    return NextResponse.json({ error: "Could not load packages" }, { status: 500 });
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
    const input = sanitizeWeddingPackageInput(body);
    const pkg = await createWeddingPackage(input);
    return NextResponse.json(pkg, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create package";
    const isValidation = /required|invalid/i.test(message);
    if (!isValidation) console.error("POST /api/packages", err);
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 });
  }
}
