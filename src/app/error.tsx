"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl">⚠️</div>
      <h1 className="mt-3 text-lg font-semibold text-gray-900">Something went wrong</h1>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Couldn’t reach the database. Check your connection — if you just deployed, make sure MongoDB
        Atlas allows access from anywhere (0.0.0.0/0).
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
