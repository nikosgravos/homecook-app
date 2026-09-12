"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// TODO: confirm/update this once the main page route is renamed
const MAIN_PATH = "/chef/dashboard";

type Option = { id: string; label: string; emoji: string };
type CategoryKey = "allergies" | "cuisines" | "foods";

interface CategoryState {
  selected: Set<string>;
  custom: Option[];
}

const ALLERGIES: Option[] = [
  { id: "gluten", label: "Gluten", emoji: "🌾" },
  { id: "dairy", label: "Dairy", emoji: "🥛" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "tree-nuts", label: "Tree nuts", emoji: "🌰" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "soy", label: "Soy", emoji: "🌱" },
  { id: "sesame", label: "Sesame", emoji: "🟤" },
  { id: "mustard", label: "Mustard", emoji: "🟡" },
  { id: "celery", label: "Celery", emoji: "🥬" },
  { id: "sulphites", label: "Sulphites", emoji: "🍷" },
];

const CUISINES: Option[] = [
  { id: "greek", label: "Greek", emoji: "🇬🇷" },
  { id: "italian", label: "Italian", emoji: "🍝" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { id: "mexican", label: "Mexican", emoji: "🌮" },
  { id: "middle-eastern", label: "Middle Eastern", emoji: "🧆" },
  { id: "indian", label: "Indian", emoji: "🍛" },
  { id: "chinese", label: "Chinese", emoji: "🥡" },
  { id: "japanese", label: "Japanese", emoji: "🍣" },
  { id: "thai", label: "Thai", emoji: "🍜" },
  { id: "french", label: "French", emoji: "🥐" },
  { id: "american", label: "American", emoji: "🍔" },
  { id: "asian-fusion", label: "Asian Fusion", emoji: "🥢" },
];

const GREEK_FOODS: Option[] = [
  { id: "souvlaki", label: "Souvlaki", emoji: "🍢" },
  { id: "gyros", label: "Gyros", emoji: "🌯" },
  { id: "moussaka", label: "Moussaka", emoji: "🍆" },
  { id: "greek-salad", label: "Greek Salad", emoji: "🥗" },
  { id: "tzatziki", label: "Tzatziki", emoji: "🥒" },
  { id: "spanakopita", label: "Spanakopita", emoji: "🥧" },
  { id: "pastitsio", label: "Pastitsio", emoji: "🍝" },
  { id: "dolmades", label: "Dolmades", emoji: "🍃" },
  { id: "gemista", label: "Gemista", emoji: "🫑" },
  { id: "fava", label: "Fava", emoji: "🫘" },
  { id: "saganaki", label: "Saganaki", emoji: "🧀" },
  { id: "kleftiko", label: "Kleftiko", emoji: "🍖" },
  { id: "loukoumades", label: "Loukoumades", emoji: "🍩" },
  { id: "baklava", label: "Baklava", emoji: "🍯" },
];

const STEPS: {
  key: CategoryKey;
  label: string;
  title: string;
  subtitle: string;
  options: Option[];
  placeholder: string;
}[] = [
  {
    key: "allergies",
    label: "Allergies",
    title: "Any allergies or intolerances?",
    subtitle: "Select everything that applies. Chefs will know to keep it out of your food.",
    options: ALLERGIES,
    placeholder: "e.g. Kiwi",
  },
  {
    key: "cuisines",
    label: "Cuisines",
    title: "Which cuisines do you love?",
    subtitle: "Pick as many as you like — we'll recommend dishes to match your taste.",
    options: CUISINES,
    placeholder: "e.g. Ethiopian",
  },
  {
    key: "foods",
    label: "Favorites",
    title: "Favorite Greek dishes?",
    subtitle: "Select the ones you already love — we'll show you more like them.",
    options: GREEK_FOODS,
    placeholder: "e.g. Bougatsa",
  },
];

function emptyState(): Record<CategoryKey, CategoryState> {
  return {
    allergies: { selected: new Set(), custom: [] },
    cuisines: { selected: new Set(), custom: [] },
    foods: { selected: new Set(), custom: [] },
  };
}

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<Record<CategoryKey, CategoryState>>(emptyState);
  const [inputs, setInputs] = useState<Record<CategoryKey, string>>({
    allergies: "",
    cuisines: "",
    foods: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const done = step >= STEPS.length;
  const current = STEPS[Math.min(step, STEPS.length - 1)];

  function toggle(category: CategoryKey, id: string) {
    setState((prev) => {
      const next = new Set(prev[category].selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [category]: { ...prev[category], selected: next } };
    });
  }

  function addCustom(category: CategoryKey) {
    const label = inputs[category].trim();
    if (!label) return;

    const predefined = STEPS.find((s) => s.key === category)!.options;
    const match = predefined.find((o) => o.label.toLowerCase() === label.toLowerCase());

    setState((prev) => {
      const nextSelected = new Set(prev[category].selected);

      if (match) {
        nextSelected.add(match.id);
        return { ...prev, [category]: { ...prev[category], selected: nextSelected } };
      }

      const id = `custom-${label.toLowerCase()}`;
      const alreadyCustom = prev[category].custom.some((o) => o.id === id);
      nextSelected.add(id);

      return {
        ...prev,
        [category]: {
          selected: nextSelected,
          custom: alreadyCustom
            ? prev[category].custom
            : [...prev[category].custom, { id, label, emoji: "✏️" }],
        },
      };
    });

    setInputs((prev) => ({ ...prev, [category]: "" }));
  }

  function removeCustom(category: CategoryKey, id: string) {
    setState((prev) => {
      const nextSelected = new Set(prev[category].selected);
      nextSelected.delete(id);
      return {
        ...prev,
        [category]: {
          selected: nextSelected,
          custom: prev[category].custom.filter((o) => o.id !== id),
        },
      };
    });
  }

  function toAnswers(key: CategoryKey, cat: CategoryState) {
    const predefined = STEPS.find((s) => s.key === key)!.options;
    return [...cat.selected].map((id) => {
      const custom = cat.custom.find((o) => o.id === id);
      if (custom) return { id: custom.id, label: custom.label };
      const found = predefined.find((o) => o.id === id)!;
      return { id: found.id, label: found.label };
    });
  }

  async function saveQuiz(status: "submitted" | "skipped" | "opted_out") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload: Record<string, unknown> = { user_id: user.id, status };
    if (status === "submitted") {
      payload.allergies = toAnswers("allergies", state.allergies);
      payload.cuisines = toAnswers("cuisines", state.cuisines);
      payload.foods = toAnswers("foods", state.foods);
      payload.submitted_at = new Date().toISOString();
    }

    await supabase.from("onboarding_quiz").upsert(payload);
  }

  async function handleFinish() {
    setSubmitting(true);
    await saveQuiz("submitted");
    setSubmitting(false);
    next();
  }

  async function handleSkip() {
    setSubmitting(true);
    await saveQuiz("skipped");
    router.push(MAIN_PATH);
    router.refresh();
  }

  async function handleOptOut() {
    setSubmitting(true);
    await saveQuiz("opted_out");
    router.push(MAIN_PATH);
    router.refresh();
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-5 sm:px-8 dark:border-zinc-800">
        <ol className="flex items-center">
          {STEPS.map((s, i) => {
            const status = done || i < step ? "done" : i === step ? "current" : "upcoming";
            return (
              <li key={s.key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      status === "upcoming"
                        ? "border border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
                        : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    }`}
                  >
                    {status === "done" ? "✓" : i + 1}
                  </span>
                  <span
                    className={`hidden text-sm font-medium sm:inline ${
                      status === "upcoming" ? "text-zinc-400 dark:text-zinc-600" : ""
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={`mx-2 h-px w-6 sm:mx-3 sm:w-12 ${
                      done || i < step ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {!done && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOptOut}
              disabled={submitting}
              className="shrink-0 text-sm font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white"
            >
              Don&apos;t ask again
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              aria-label="Skip for now"
              className="shrink-0 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 sm:px-8">
        {done ? (
          <DoneScreen state={state} onEdit={() => setStep(0)} mainPath={MAIN_PATH} />
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{current.title}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{current.subtitle}</p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {[...current.options, ...state[current.key].custom].map((option) => {
                const isCustom = option.id.startsWith("custom-");
                const isSelected = state[current.key].selected.has(option.id);
                return (
                  <div key={option.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggle(current.key, option.id)}
                      aria-pressed={isSelected}
                      className={`flex w-full flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-xs font-medium leading-tight">{option.label}</span>
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => removeCustom(current.key, option.id)}
                        aria-label={`Remove ${option.label}`}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCustom(current.key);
              }}
              className="mt-6 flex gap-2"
            >
              <input
                type="text"
                value={inputs[current.key]}
                onChange={(e) => setInputs((prev) => ({ ...prev, [current.key]: e.target.value }))}
                placeholder={`Don't see yours? Add it — ${current.placeholder}`}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
              />
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Add
              </button>
            </form>

            <div className="mt-auto flex items-center justify-between pt-10">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:invisible dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={step === STEPS.length - 1 ? handleFinish : next}
                disabled={submitting}
                className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {submitting ? "Saving…" : step === STEPS.length - 1 ? "Finish" : "Continue"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function DoneScreen({
  state,
  onEdit,
  mainPath,
}: {
  state: Record<CategoryKey, CategoryState>;
  onEdit: () => void;
  mainPath: string;
}) {
  const counts = {
    allergies: state.allergies.selected.size,
    cuisines: state.cuisines.selected.size,
    foods: state.foods.selected.size,
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="text-4xl">🎉</span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">You&apos;re all set!</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {counts.allergies} allergies noted, {counts.cuisines} cuisines you love, and {counts.foods}{" "}
        Greek favorites saved.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Edit answers
        </button>
        <Link
          href={mainPath}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Start exploring
        </Link>
      </div>
    </div>
  );
}