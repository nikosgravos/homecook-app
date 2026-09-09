"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChefDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [dishCount, setDishCount] = useState(0);
  const [totalPortions, setTotalPortions] = useState(0);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("dishes")
        .select("quantity_available")
        .eq("chef_id", user.id);

      if (data) {
        setDishCount(data.length);
        setTotalPortions(data.reduce((sum, d) => sum + d.quantity_available, 0));
      }

      setLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-6 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-8 py-8">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back. Here's a quick look at your menu.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Πιάτα στο μενού</p>
            <p className="mt-1 text-2xl font-semibold">{dishCount}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Μερίδες διαθέσιμες</p>
            <p className="mt-1 text-2xl font-semibold">{totalPortions}</p>
          </div>
        </div>

        <Link
          href="/chef/dishes"
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Διαχείριση μενού
        </Link>
      </main>
    </div>
  );
}