import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function AddExpenseForm() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  const createExpense = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add expense");
      return res.json();
    },
    onMutate: async (newItem) => {
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const prev = qc.getQueryData<{ expenses: any[] }>(["expenses"]);
      if (prev) {
        qc.setQueryData(["expenses"], {
          expenses: [...prev.expenses, { id: Date.now(), ...newItem }],
        });
      }
      return { prev };
    },
    onError: (_err, _newItem, ctx) => {
      if (ctx?.prev) qc.setQueryData(["expenses"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title && typeof amount === "number") {
          createExpense.mutate({ title, amount });
        }
      }}
      className="mt-6 flex gap-2"
    >
      <input
        className="w-1/2 rounded border p-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-40 rounded border p-2"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value === "" ? "" : Number(e.target.value))
        }
        required
      />
      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={createExpense.isPending}
      >
        {createExpense.isPending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
