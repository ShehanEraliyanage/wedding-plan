import type { BucketId, Category } from "@/types";

export interface CategoryMeta {
  id: Category;
  label: string;
  icon: string;
  /** Tailwind classes for the category chip. */
  chip: string;
  bucket: BucketId;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "venue", label: "Venue / Hotel", icon: "🏛️", chip: "bg-rose-100 text-rose-700", bucket: "venueFood" },
  { id: "photography", label: "Photo / Video", icon: "📸", chip: "bg-violet-100 text-violet-700", bucket: "photoVideo" },
  { id: "makeup", label: "Makeup", icon: "💄", chip: "bg-pink-100 text-pink-700", bucket: "makeupDressing" },
  { id: "outfits", label: "Outfits", icon: "👗", chip: "bg-fuchsia-100 text-fuchsia-700", bucket: "makeupDressing" },
  { id: "decor", label: "Decor / Flowers", icon: "🌸", chip: "bg-emerald-100 text-emerald-700", bucket: "decor" },
  { id: "cake", label: "Cake", icon: "🎂", chip: "bg-amber-100 text-amber-700", bucket: "cakeExtras" },
  { id: "music", label: "Music / DJ", icon: "🎵", chip: "bg-sky-100 text-sky-700", bucket: "cakeExtras" },
  { id: "planner", label: "Planner", icon: "📋", chip: "bg-indigo-100 text-indigo-700", bucket: "cakeExtras" },
  { id: "cars", label: "Cars", icon: "🚗", chip: "bg-slate-100 text-slate-700", bucket: "cakeExtras" },
  { id: "invitations", label: "Invitations", icon: "✉️", chip: "bg-teal-100 text-teal-700", bucket: "cakeExtras" },
  { id: "other", label: "Other", icon: "✨", chip: "bg-gray-100 text-gray-700", bucket: "cakeExtras" },
];

const BY_ID: Record<Category, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<Category, CategoryMeta>,
);

export function categoryMeta(id: Category): CategoryMeta {
  return BY_ID[id] ?? BY_ID.other;
}

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && value in BY_ID;
}
