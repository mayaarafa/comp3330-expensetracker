// /frontend/src/routes/expenses.new.tsx
import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api"; // if no Vite proxy, use: 'http://localhost:3000/api'

export type Expense = {
  id: number;
  title: string;
  amount: number;
  fileUrl?: string | null;
};

export default function ExpenseNewPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [amountChanged, setAmountChanged] = useState(false);

  const amountError =
    amountChanged &&
    (amount === "" || typeof amount !== "number" || amount <= 0)
      ? "Amount must be greater than 0"
      : null;

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const message = await res.text().catch(() => "");
        throw new Error(message || "Failed to add expense");
      }
      return (await res.json()) as { expense: Expense };
    },
    onMutate: async (newItem) => {
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const previous = qc.getQueryData<{ expenses: Expense[] }>(["expenses"]);
      if (previous) {
        const optimistic: Expense = {
          id: Date.now(),
          title: newItem.title,
          amount: newItem.amount,
          fileUrl: null,
        };
        qc.setQueryData(["expenses"], {
          expenses: [...previous.expenses, optimistic],
        });
      }
      return { previous };
    },
    onError: (_err, _newItem, ctx) => {
      if (ctx?.previous) qc.setQueryData(["expenses"], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setTitle("");
      setAmount("");
      setAmountChanged(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required");
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return setError("Amount must be greater than 0");
    }
    await mutation.mutate({ title: title.trim(), amount });
    // router.navigate({ to: "/expenses" });
  };

  return (
    <section className="mx-auto max-w-3xl p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded border bg-background p-6"
      >
        <h2 className="text-xl font-semibold">New Expense</h2>

        <label className="block">
          <span className="text-sm text-muted-foreground">Title</span>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="Coffee"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-muted-foreground">Amount</span>
          <input
            className="mt-1 w-52 rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            type="number"
            placeholder="4"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value === "" ? "" : Number(e.target.value));
              setAmountChanged(true);
            }}
          />
        </label>

        {amountError && <p className="text-sm text-red-600">{amountError}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded bg-black px-3 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
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
                Adding…
              </span>
            ) : (
              "Add Expense"
            )}
          </button>

          <button
            type="button"
            className="text-sm underline"
            onClick={() => router.navigate({ to: "/expenses" })}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
