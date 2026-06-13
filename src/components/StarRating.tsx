"use client";

export default function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number | undefined;
  onChange?: (value: number | undefined) => void;
  size?: "sm" | "md";
}) {
  const readOnly = !onChange;
  const textSize = size === "sm" ? "text-base" : "text-2xl";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (value ?? 0) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => {
              if (!onChange) return;
              // Tapping the current rating clears it.
              onChange(value === star ? undefined : star);
            }}
            className={`${textSize} leading-none ${readOnly ? "cursor-default" : "cursor-pointer"} ${
              filled ? "text-amber-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
