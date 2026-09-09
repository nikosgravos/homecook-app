export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-8 py-6 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight">homecook-app</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Welcome to homecook-app
        </h2>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Home cooking, made simple. This is the front page — start building from
          here.
        </p>
      </main>
    </div>
  );
}
