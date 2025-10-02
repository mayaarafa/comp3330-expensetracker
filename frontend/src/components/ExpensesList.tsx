import { useQuery } from "@tanstack/react-query";

export function ExpensesList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/expenses");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{
        expenses: { id: number; title: string; amount: number }[];
      }>;
    },
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  return (
    <ul className="mt-4 space-y-2">
      {data!.expenses.map((e) => (
        <li
          key={e.id}
          className="flex justify-between rounded border p-2 bg-white"
        >
          <span>{e.title}</span>
          <span>${e.amount}</span>
        </li>
      ))}
    </ul>
  );
}
