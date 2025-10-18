import { useQuery, useQueryClient } from "@tanstack/react-query";
import UploadExpenseForm from "../components/uploadExpenseForm";

type Expense = {
  id: number;
  title: string;
  amount: number;
  fileUrl: string | null;
};

const API = "/api";

export default function ExpenseDetailPage({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      console.log("Fetching:", `${API}/expenses/${id}`);
      const res = await fetch(`${API}/expenses/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch expense with id ${id}`);
      return res.json() as Promise<{ expense: Expense | null }>;
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
      <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>
    );

  const item = data?.expense;
  if (!item)
    return (
      <p className="p-6 text-sm text-muted-foreground">Expense not found.</p>
    );

  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="rounded border bg-background text-foreground p-6">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Amount</p>
        <p className="text-lg tabular-nums">${item.amount}</p>

        <div className="mt-4">
          {item.fileUrl ? (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              Download receipt
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              Receipt not uploaded.
            </p>
          )}
        </div>

        <div className="mt-6">
          <UploadExpenseForm
            expenseId={item.id}
            onUploaded={() => {
              queryClient.invalidateQueries({ queryKey: ["expenses", id] });
            }}
          />
        </div>
      </div>
    </section>
  );
}
