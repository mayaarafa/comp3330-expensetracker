import { useQuery } from "@tanstack/react-query";

export function ExpensesList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/expenses");
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json() as Promise<{
        expenses: { id: number; title: string; amount: number }[];
      }>;
    },
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (isError)
    return <p className="text-sm text-red-600">{(error as Error).message}</p>;

  return (
    <ul className="mt-4 space-y-2">
      {data!.expenses.map((e) => (
        <li
          key={e.id}
          className="flex items-center justify-between rounded border bg-background text-foreground p-3 shadow-sm"
        >
          <span className="font-medium">{e.title}</span>
          <span className="tabular-nums">${e.amount}</span>
        </li>
      ))}
    </ul>
  );
}
