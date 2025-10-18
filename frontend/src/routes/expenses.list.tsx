// /frontend/src/routes/expenses.list.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export type Expense = {
  id: number;
  title: string;
  amount: number;
  fileUrl?: string | null;
};

// Use "/api" if you configured a Vite proxy in dev; otherwise use
// const API = 'http://localhost:3000/api'
const API = "/api";

export default function ExpensesListPage() {
  const qc = useQueryClient();

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

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API}/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete expense");
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const previous = qc.getQueryData<{ expenses: Expense[] }>(["expenses"]);
      if (previous) {
        qc.setQueryData(["expenses"], {
          expenses: previous.expenses.filter((item) => item.id !== id),
        });
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["expenses"], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        Loading expenses…
      </div>
    );
  }

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
        <div className="rounded border bg-background p-6 text-center">
          <h3 className="text-lg font-semibold">No expenses yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start by adding your first expense using the form above.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {data?.expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center justify-between rounded border bg-background p-3 shadow-sm"
            >
              <div className="flex flex-col">
                <Link
                  to="/expenses/$id"
                  params={{ id: expense.id.toString() }}
                  className="font-medium underline hover:text-primary"
                >
                  {expense.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  ${expense.amount}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {expense.fileUrl && (
                  <a
                    href={expense.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Download
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => deleteExpense.mutate(expense.id)}
                  disabled={deleteExpense.isPending}
                  className="text-sm text-red-600 underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteExpense.isPending ? "Removing…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
