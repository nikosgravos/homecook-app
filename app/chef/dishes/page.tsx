"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Dish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number;
};

export default function ChefDishesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] = useState(true);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = descriptionRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [description]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setLoadingUser(false);
      loadDishes();
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDishes() {
    const { data, error } = await supabase
      .from("dishes")
      .select("id, name, description, price, quantity_available")
      .order("created_at", { ascending: false });

    if (!error && data) setDishes(data as Dish[]);
  }

  function handleSelectDish(dish: Dish) {
    setSelectedId(dish.id);
    setName(dish.name);
    setDescription(dish.description ?? "");
    setPrice(String(dish.price));
    setQuantity(String(dish.quantity_available));
    setError(null);
  }

  function handleNewDish() {
    setSelectedId(null);
    setName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      description,
      price: parseFloat(price),
      quantity_available: parseInt(quantity, 10),
    };

    if (selectedId) {
      const { error } = await supabase.from("dishes").update(payload).eq("id", selectedId);
      setSaving(false);
      if (error) { setError(error.message); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("You must be logged in."); setSaving(false); return; }

      const { error } = await supabase.from("dishes").insert({ ...payload, chef_id: user.id });
      setSaving(false);
      if (error) { setError(error.message); return; }
    }

    handleNewDish();
    loadDishes();
  }

  async function handleDelete(id: string) {
    await supabase.from("dishes").delete().eq("id", id);
    if (selectedId === id) handleNewDish();
    loadDishes();
  }

  if (loadingUser) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-6 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight">My dishes</h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-8 py-8 lg:flex-row">
        {/* Left: list */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your menu</h2>
            <button
              onClick={handleNewDish}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              + New dish
            </button>
          </div>

          {dishes.length === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
              No dishes yet — add your first one on the right.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {dishes.map((dish) => (
                <li
                  key={dish.id}
                  onClick={() => handleSelectDish(dish)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                    selectedId === dish.id
                      ? "border-zinc-900 bg-zinc-100 dark:border-white dark:bg-zinc-800"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div>
                    <p className="font-medium">{dish.name}</p>
                    {dish.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{dish.description}</p>
                    )}
                    <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-500">
                      {dish.quantity_available} {dish.quantity_available === 1 ? "Μερίδα Διαθέσιμη" : "Μερίδες Διαθέσιμες"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">€{dish.price.toFixed(2)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(dish.id); }}
                      className="text-sm text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: add/edit form */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800 lg:w-96 lg:shrink-0"
        >
          <h2 className="text-sm font-semibold">
            {selectedId ? "Edit dish" : "Add a dish"}
          </h2>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
              placeholder="Pastitsio"
            />
            <p className="text-right text-xs text-zinc-400">{name.length}/40</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea
              id="description"
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={150}
              rows={2}
              className="resize-none overflow-hidden rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
              placeholder="Homemade, serves 2"
            />
            <p className="text-right text-xs text-zinc-400">{description.length}/150</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="price" className="text-sm font-medium">Price (€)</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="8.50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="quantity" className="text-sm font-medium">Μερίδες διαθέσιμες</label>
            <input
              id="quantity"
              type="number"
              min="0"
              step="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="5"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Saving…" : selectedId ? "Save changes" : "Add dish"}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={handleNewDish}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}