"use client";

import { useRef, useState } from "react";
import { MAX_PHOTOS, compressImage, dataUrlBytes, formatBytes } from "@/lib/image";

export default function PhotoCapture({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBytes = photos.reduce((sum, p) => sum + dataUrlBytes(p), 0);
  const full = photos.length >= MAX_PHOTOS;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || !fileList.length) return;
    setError(null);
    setBusy(true);
    try {
      const room = MAX_PHOTOS - photos.length;
      const files = Array.from(fileList).slice(0, room);
      const next = [...photos];
      for (const file of files) {
        try {
          next.push(await compressImage(file));
        } catch {
          setError("Couldn't process one of the photos.");
        }
      }
      onChange(next);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove photo"
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs leading-none text-white"
            >
              ✕
            </button>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 disabled:opacity-50"
          >
            {busy ? (
              <span className="text-xs">…</span>
            ) : (
              <>
                <span className="text-xl leading-none">📷</span>
                <span className="text-[10px] font-medium">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-1.5 text-xs text-gray-400">
        {photos.length}/{MAX_PHOTOS} photos
        {totalBytes > 0 && ` · ${formatBytes(totalBytes)}`}
      </p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
