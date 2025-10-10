// /frontend/src/routes/expenses.new.tsx
import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api"; // if no Vite proxy, use: 'http://localhost:3000/api'

export default function ExpenseNewPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  const createExpense = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      return res.json() as Promise<{
        expense: { id: number; title: string; amount: number };
      }>;
    },
    onSuccess: () => {
      // Refresh the list and go back
      qc.invalidateQueries({ queryKey: ["expenses"] });
      router.navigate({ to: "/expenses" });
    },
    onError: (e: any) => {
      setError(e.message ?? "Failed to create expense");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title || typeof amount !== "number") {
      setError("Please provide a title and a numeric amount.");
      return;
    }
    createExpense.mutate({ title, amount });
  }

  return (
    <section className="mx-auto max-w-3xl p-6">
      <form
        onSubmit={onSubmit}
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
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            disabled={createExpense.isPending}
          >
            {createExpense.isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => router.navigate({ to: "/expenses" })}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
