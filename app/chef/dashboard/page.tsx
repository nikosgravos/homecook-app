// Page shell only — no data, no auth check yet. Lives at /chef/dashboard.
export default function ChefDashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-6 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-8 py-8">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back. This is where your dishes and orders will show up.
        </p>

        <div className="flex min-h-[240px] flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
          Dish list goes here
        </div>
      </main>
    </div>
  );
}