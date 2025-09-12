// server/routes/expenses.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// In‑memory DB for Week 2 (we'll replace with Postgres in Week 4)
const expenses: Expense[] = [
  { id: 1, title: "Coffee", amount: 4 },
  { id: 2, title: "Groceries", amount: 35 },
];

// Zod schemas
const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
});

const createExpenseSchema = expenseSchema.omit({ id: true });

export type Expense = z.infer<typeof expenseSchema>;

// Router
export const expensesRoute = new Hono()
  // GET /api/expenses → list
  .get("/", (c) => c.json({ expenses }))

  // GET /api/expenses/:id → single item
  // Enforce numeric id with a param regex (\\d+)
  .get("/:id{\\d+}", (c) => {
    const id = Number(c.req.param("id"));
    const item = expenses.find((e) => e.id === id);
    if (!item) return c.json({ error: "Not found" }, 404);
    return c.json({ expense: item });
  })

  // POST /api/expenses → create (validated)
  .post("/", zValidator("json", createExpenseSchema), (c) => {
    const data = c.req.valid("json"); // { title, amount }
    const nextId = (expenses.at(-1)?.id ?? 0) + 1;
    const created: Expense = { id: nextId, ...data };
    expenses.push(created);
    return c.json({ expense: created }, 201);
  })

  // DELETE /api/expenses/:id → remove
  .delete("/:id{\\d+}", (c) => {
    const id = Number(c.req.param("id"));
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    const [removed] = expenses.splice(idx, 1);
    return c.json({ deleted: removed });
  });
