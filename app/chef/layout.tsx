"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/chef/dashboard", label: "Dashboard" },
  { href: "/chef/dishes", label: "My dishes" },
  { href: "/chef/orders", label: "Orders" },
];

// Shared shell for every /chef/* page — sidebar nav + top bar.
// Nothing here checks auth yet.
export default function ChefLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 p-6 sm:block dark:border-zinc-800">
        <p className="mb-6 text-sm font-semibold tracking-tight text-zinc-500 dark:text-zinc-400">
          Chef area
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "rounded-md bg-zinc-900 px-3 py-2 font-medium text-white dark:bg-white dark:text-zinc-900"
                    : "rounded-md px-3 py-2 font-medium text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}