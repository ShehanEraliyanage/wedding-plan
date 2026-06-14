import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) throw new Error("Missing MONGODB_URI environment variable");
if (!dbName) throw new Error("Missing MONGODB_DB environment variable");

export const VENDORS_COLLECTION = "wedding_vendors";
export const PACKAGES_COLLECTION = "wedding_packages";
export const GIFTS_COLLECTION = "wedding_gifts";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Cache the connection promise on globalThis so dev hot-reload and warm
// serverless invocations reuse a single pool instead of exhausting it.
const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? new MongoClient(uri).connect();

if (!global._mongoClientPromise) {
  global._mongoClientPromise = clientPromise;
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
