export type Category =
  | "venue"
  | "photography"
  | "makeup"
  | "decor"
  | "cake"
  | "outfits"
  | "music"
  | "planner"
  | "cars"
  | "invitations"
  | "other";

export type PriceType = "per_pax" | "total" | "per_day";

export interface Package {
  id: string;
  name: string;
  price: number;
  priceType: PriceType;
  minGuests?: number;
  includes?: string[];
}

export interface Vendor {
  _id?: string;
  name: string;
  category: Category;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  location?: string;
  rating?: number;
  notes?: string;
  photos: string[];
  packages: Package[];
  estimatedCost?: number;
  createdAt: string;
  updatedAt: string;
}

/** A vendor without photos — used for the fast list view. */
export type VendorSlim = Omit<Vendor, "photos"> & { photoCount: number };

/** Payload the create/edit form sends. Server sets _id and timestamps. */
export type VendorInput = Omit<Vendor, "_id" | "createdAt" | "updatedAt">;

export type BucketId =
  | "venueFood"
  | "photoVideo"
  | "makeupDressing"
  | "decor"
  | "cakeExtras";

export interface BucketResult {
  id: BucketId;
  label: string;
  pct: number;
  pctRange: [number, number];
  recommended: number;
  allocated: number;
  vendorCount: number;
  status: "under" | "near" | "over";
}

export interface ApiError {
  error: string;
}
