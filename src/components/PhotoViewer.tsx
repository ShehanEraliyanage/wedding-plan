"use client";

import { useState } from "react";

export default function PhotoViewer({ photos }: { photos: string[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (!photos.length) return null;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[active]}
            alt={`Photo ${active + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl text-white"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
