// /frontend/src/routes/expenses.list.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export type Expense = { id: number; title: string; amount: number };

// Use "/api" if you configured a Vite proxy in dev; otherwise use
// const API = 'http://localhost:3000/api'
const API = "/api";

export default function ExpensesListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch(`${API}/expenses`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
      }
      return (await res.json()) as { expenses: Expense[] };
    },
    staleTime: 5_000,
    retry: 1,
  });

  if (isLoading)
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (isError)
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          Failed to fetch: {(error as Error).message}
        </p>
        <button
          className="mt-3 rounded border px-3 py-1"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Retry
        </button>
      </div>
    );

  const items = data?.expenses ?? [];

  return (
    <section className="mx-auto max-w-3xl p-6">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expenses</h2>
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {items.length === 0 ? (
        <div className="rounded border bg-background p-6">
          <p className="text-sm text-muted-foreground">No expenses yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded border bg-background text-foreground p-3 shadow-sm"
            >
              <Link
                to="/expenses/$id"
                params={{ id: e.id }}
                className="font-medium underline hover:text-primary"
              >
                {e.title}
              </Link>
              <span className="tabular-nums">${e.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
