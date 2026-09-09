import Link from "next/link";

// Shared shell for every /chef/* page — sidebar nav + top bar.
// Nothing here checks auth yet.
export default function ChefLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 p-6 sm:block dark:border-zinc-800">
        <p className="mb-6 text-sm font-semibold tracking-tight text-zinc-500 dark:text-zinc-400">
          Chef area
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/chef/dashboard"
            className="rounded-md px-3 py-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Dashboard
          </Link>
          <Link
            href="/chef/dishes"
            className="rounded-md px-3 py-2 font-medium text-zinc-400 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:bg-zinc-800"
          >
            My dishes
          </Link>
          <Link
            href="/chef/orders"
            className="rounded-md px-3 py-2 font-medium text-zinc-400 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:bg-zinc-800"
          >
            Orders
          </Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}