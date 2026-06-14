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

/**
 * One vendor line inside a WeddingPackage (a bundle). The display fields are a
 * denormalized snapshot of the vendor + chosen pricing tier so list/detail/compare
 * views render with no per-vendor fetch fan-out. vendorId + tierId are kept so the
 * edit form can re-resolve live values from the vendor catalog and refresh the snapshot.
 */
export interface WeddingPackageItem {
  vendorId: string;
  tierId?: string; // chosen Package (pricing tier) id; undefined if vendor has none
  vendorName: string;
  category: Category;
  tierName?: string;
  price: number; // tier price, or vendor.estimatedCost ?? 0
  priceType: PriceType; // tier priceType; "total" when falling back to estimatedCost
}

/** A bundle of vendors forming a complete wedding plan. UI label: "Package". */
export interface WeddingPackage {
  _id?: string;
  name: string;
  guestCount?: number; // drives per_pax cost math
  notes?: string;
  items: WeddingPackageItem[];
  createdAt: string;
  updatedAt: string;
}

/** Payload the package create/edit form sends. Server sets _id and timestamps. */
export type WeddingPackageInput = Omit<WeddingPackage, "_id" | "createdAt" | "updatedAt">;

/** A gift or cash contribution received from a guest. */
export interface Gift {
  _id?: string;
  guestName: string;
  amount?: number; // cash received
  item?: string; // gift item description
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload the gift create/edit form sends. Server sets _id and timestamps. */
export type GiftInput = Omit<Gift, "_id" | "createdAt" | "updatedAt">;

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
