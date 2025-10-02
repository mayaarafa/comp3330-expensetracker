import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function AddExpenseForm() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setTitle("");
      setAmount("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title && typeof amount === "number") {
          mutation.mutate({ title, amount });
        }
      }}
      className="flex gap-2 mt-4"
    >
      <input
        className="border p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        className="border p-2"
        type="number"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value === "" ? "" : Number(e.target.value))
        }
        placeholder="Amount"
      />
      <button
        className="bg-black text-white px-3 py-1 rounded"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
