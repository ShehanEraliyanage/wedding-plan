export default function Loading() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-gray-200" />
      ))}
    </div>
  );
}
