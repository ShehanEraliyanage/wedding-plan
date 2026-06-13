import { ObjectId, type Document, type WithId } from "mongodb";
import { getDb, VENDORS_COLLECTION } from "@/lib/mongodb";
import { isCategory } from "@/lib/categories";
import type { Package, PriceType, Vendor, VendorInput, VendorSlim } from "@/types";

const PRICE_TYPES: PriceType[] = ["per_pax", "total", "per_day"];

async function collection() {
  const db = await getDb();
  return db.collection(VENDORS_COLLECTION);
}

function num(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function str(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t.length ? t : undefined;
}

function sanitizePackages(input: unknown): Package[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((raw, i): Package | null => {
      if (typeof raw !== "object" || raw === null) return null;
      const p = raw as Record<string, unknown>;
      const name = str(p.name) ?? "";
      const price = num(p.price) ?? 0;
      const priceType = PRICE_TYPES.includes(p.priceType as PriceType)
        ? (p.priceType as PriceType)
        : "per_pax";
      // Drop fully-empty package rows.
      if (!name && !price) return null;
      const includes = Array.isArray(p.includes)
        ? (p.includes as unknown[]).map((x) => String(x).trim()).filter(Boolean)
        : str(p.includes)
          ? str(p.includes)!.split("\n").map((x) => x.trim()).filter(Boolean)
          : [];
      return {
        id: str(p.id) ?? `pkg_${i}_${name.slice(0, 6)}`,
        name: name || "Package",
        price,
        priceType,
        minGuests: num(p.minGuests),
        includes,
      };
    })
    .filter((p): p is Package => p !== null);
}

/** Validate + normalize a raw request body into a VendorInput. Throws on bad data. */
export function sanitizeVendorInput(body: unknown): VendorInput {
  if (typeof body !== "object" || body === null) throw new Error("Invalid body");
  const b = body as Record<string, unknown>;

  const name = str(b.name);
  if (!name) throw new Error("Name is required");
  if (!isCategory(b.category)) throw new Error("Valid category is required");

  const photos = Array.isArray(b.photos)
    ? (b.photos as unknown[]).filter((p): p is string => typeof p === "string" && p.startsWith("data:"))
    : [];

  const rating = num(b.rating);

  return {
    name,
    category: b.category,
    contactPerson: str(b.contactPerson),
    phone: str(b.phone),
    email: str(b.email),
    website: str(b.website),
    location: str(b.location),
    rating: rating ? Math.min(5, Math.max(1, Math.round(rating))) : undefined,
    notes: str(b.notes),
    photos,
    packages: sanitizePackages(b.packages),
    estimatedCost: num(b.estimatedCost),
  };
}

// ---- serialization (Mongo doc -> client JSON) ----

function serialize(doc: WithId<Document>): Vendor {
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return {
    ...(rest as Omit<Vendor, "_id" | "createdAt" | "updatedAt">),
    _id: _id.toString(),
    createdAt: toIso(createdAt),
    updatedAt: toIso(updatedAt),
  };
}

function serializeSlim(doc: WithId<Document>): VendorSlim {
  const { photos, ...vendor } = serialize(doc);
  return { ...vendor, photoCount: Array.isArray(photos) ? photos.length : 0 };
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

// ---- data access ----

export function listVendors(category: string | undefined, slim: true): Promise<VendorSlim[]>;
export function listVendors(category?: string, slim?: false): Promise<Vendor[]>;
export async function listVendors(category?: string, slim = false): Promise<Vendor[] | VendorSlim[]> {
  const col = await collection();
  const filter = isCategory(category) ? { category } : {};
  const projection = slim ? { photos: 0 } : {};
  const docs = await col.find(filter, { projection }).sort({ createdAt: -1 }).toArray();
  if (slim) {
    // photos excluded by projection, but we still want photoCount — fetch sizes separately.
    return await attachPhotoCounts(docs);
  }
  return docs.map(serialize);
}

/** When photos are projected out we lose the count, so compute it with an aggregate. */
async function attachPhotoCounts(docs: WithId<Document>[]): Promise<VendorSlim[]> {
  if (!docs.length) return [];
  const col = await collection();
  const counts = await col
    .aggregate<{ _id: ObjectId; photoCount: number }>([
      { $match: { _id: { $in: docs.map((d) => d._id) } } },
      { $project: { photoCount: { $size: { $ifNull: ["$photos", []] } } } },
    ])
    .toArray();
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.photoCount]));
  return docs.map((d) => {
    const slim = serializeSlim(d);
    slim.photoCount = countMap.get(d._id.toString()) ?? 0;
    return slim;
  });
}

export async function getVendor(id: string): Promise<Vendor | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? serialize(doc) : null;
}

export async function createVendor(input: VendorInput): Promise<Vendor> {
  const col = await collection();
  const now = new Date();
  const doc = { ...input, createdAt: now, updatedAt: now };
  const result = await col.insertOne(doc);
  return serialize({ ...doc, _id: result.insertedId });
}

export async function updateVendor(id: string, input: VendorInput): Promise<Vendor | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return result ? serialize(result) : null;
}

export async function deleteVendor(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await collection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
