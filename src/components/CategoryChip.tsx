import { categoryMeta } from "@/lib/categories";
import type { Category } from "@/types";

export default function CategoryChip({
  category,
  showIcon = true,
}: {
  category: Category;
  showIcon?: boolean;
}) {
  const meta = categoryMeta(category);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.chip}`}
    >
      {showIcon && <span>{meta.icon}</span>}
      {meta.label}
    </span>
  );
}
