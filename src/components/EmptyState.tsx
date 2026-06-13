import Link from "next/link";

export default function EmptyState({
  icon = "📝",
  title,
  message,
  actionHref,
  actionLabel,
}: {
  icon?: string;
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <h2 className="mt-3 text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
