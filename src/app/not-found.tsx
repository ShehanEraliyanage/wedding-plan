import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl">🔍</div>
      <h1 className="mt-3 text-lg font-semibold text-gray-900">Not found</h1>
      <p className="mt-1 text-sm text-gray-500">This vendor may have been deleted.</p>
      <Link href="/" className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">
        Back to vendors
      </Link>
    </div>
  );
}
