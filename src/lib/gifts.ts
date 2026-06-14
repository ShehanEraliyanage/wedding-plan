import { ObjectId, type Document, type WithId } from "mongodb";
import { getDb, GIFTS_COLLECTION } from "@/lib/mongodb";
import type { Gift, GiftInput } from "@/types";

async function collection() {
  const db = await getDb();
  return db.collection(GIFTS_COLLECTION);
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

/** Validate + normalize a raw request body into a GiftInput. Throws on bad data. */
export function sanitizeGiftInput(body: unknown): GiftInput {
  if (typeof body !== "object" || body === null) throw new Error("Invalid body");
  const b = body as Record<string, unknown>;

  const guestName = str(b.guestName);
  if (!guestName) throw new Error("Guest name is required");

  return {
    guestName,
    amount: num(b.amount),
    item: str(b.item),
    notes: str(b.notes),
  };
}

// ---- serialization (Mongo doc -> client JSON) ----

function serialize(doc: WithId<Document>): Gift {
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return {
    ...(rest as Omit<Gift, "_id" | "createdAt" | "updatedAt">),
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

export async function listGifts(): Promise<Gift[]> {
  const col = await collection();
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function getGift(id: string): Promise<Gift | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? serialize(doc) : null;
}

export async function createGift(input: GiftInput): Promise<Gift> {
  const col = await collection();
  const now = new Date();
  const doc = { ...input, createdAt: now, updatedAt: now };
  const result = await col.insertOne(doc);
  return serialize({ ...doc, _id: result.insertedId });
}

export async function updateGift(id: string, input: GiftInput): Promise<Gift | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return result ? serialize(result) : null;
}

export async function deleteGift(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await collection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
