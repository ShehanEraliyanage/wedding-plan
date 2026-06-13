"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompareIds } from "@/lib/hooks";

const TABS = [
  { href: "/", label: "Vendors", icon: "🏠", match: (p: string) => p === "/" || p.startsWith("/vendors") },
  { href: "/compare", label: "Compare", icon: "⚖️", match: (p: string) => p.startsWith("/compare") },
  { href: "/budget", label: "Budget", icon: "💰", match: (p: string) => p.startsWith("/budget") },
];

export default function BottomNav() {
  const pathname = usePathname();
  const compareCount = useCompareIds().length;

  // The add/edit form provides its own sticky save bar.
  if (pathname.endsWith("/new") || pathname.endsWith("/edit")) return null;

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-screen-sm border-t border-gray-200 bg-white">
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-brand-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
              {tab.href === "/compare" && compareCount > 0 && (
                <span className="absolute right-1/2 top-1 translate-x-4 rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                  {compareCount}
                </span>
              )}
            </Link>
          );
        })}
        <Link
          href="/vendors/new"
          className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold text-brand-600"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-lg leading-none text-white">
            +
          </span>
          Add
        </Link>
      </div>
    </nav>
  );
}
