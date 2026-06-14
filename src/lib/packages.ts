import { ObjectId, type Document, type WithId } from "mongodb";
import { getDb, PACKAGES_COLLECTION } from "@/lib/mongodb";
import { isCategory } from "@/lib/categories";
import type { Category, PriceType, WeddingPackage, WeddingPackageInput, WeddingPackageItem } from "@/types";

const PRICE_TYPES: PriceType[] = ["per_pax", "total", "per_day"];

async function collection() {
  const db = await getDb();
  return db.collection(PACKAGES_COLLECTION);
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

function sanitizeItems(input: unknown): WeddingPackageItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((raw): WeddingPackageItem | null => {
      if (typeof raw !== "object" || raw === null) return null;
      const it = raw as Record<string, unknown>;
      const vendorId = str(it.vendorId);
      // A line without a vendor is meaningless — drop it.
      if (!vendorId) return null;
      const category: Category = isCategory(it.category) ? it.category : "other";
      const priceType = PRICE_TYPES.includes(it.priceType as PriceType)
        ? (it.priceType as PriceType)
        : "total";
      return {
        vendorId,
        tierId: str(it.tierId),
        vendorName: str(it.vendorName) ?? "Vendor",
        category,
        tierName: str(it.tierName),
        price: num(it.price) ?? 0,
        priceType,
      };
    })
    .filter((it): it is WeddingPackageItem => it !== null);
}

/** Validate + normalize a raw request body into a WeddingPackageInput. Throws on bad data. */
export function sanitizeWeddingPackageInput(body: unknown): WeddingPackageInput {
  if (typeof body !== "object" || body === null) throw new Error("Invalid body");
  const b = body as Record<string, unknown>;

  const name = str(b.name);
  if (!name) throw new Error("Name is required");

  return {
    name,
    guestCount: num(b.guestCount),
    notes: str(b.notes),
    items: sanitizeItems(b.items),
  };
}

// ---- serialization (Mongo doc -> client JSON) ----

function serialize(doc: WithId<Document>): WeddingPackage {
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return {
    ...(rest as Omit<WeddingPackage, "_id" | "createdAt" | "updatedAt">),
    _id: _id.toString(),
    createdAt: toIso(createdAt),
    updatedAt: toIso(updatedAt),
  };
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

// ---- data access ----

export async function listWeddingPackages(): Promise<WeddingPackage[]> {
  const col = await collection();
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function getWeddingPackage(id: string): Promise<WeddingPackage | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? serialize(doc) : null;
}

export async function createWeddingPackage(input: WeddingPackageInput): Promise<WeddingPackage> {
  const col = await collection();
  const now = new Date();
  const doc = { ...input, createdAt: now, updatedAt: now };
  const result = await col.insertOne(doc);
  return serialize({ ...doc, _id: result.insertedId });
}

export async function updateWeddingPackage(
  id: string,
  input: WeddingPackageInput,
): Promise<WeddingPackage | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return result ? serialize(result) : null;
}

export async function deleteWeddingPackage(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await collection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
