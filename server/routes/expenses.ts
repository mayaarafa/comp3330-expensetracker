// Example helpers (optional) — place at top of server/routes/expenses.ts
const ok = <T>(c: any, data: T, status = 200) => c.json({ data }, status);
const err = (c: any, message: string, status = 400) =>
  c.json({ error: { message } }, status);

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

// Allow updating title and/or amount, but not id
const updateExpenseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  amount: z.number().int().positive().optional(),
});

const createExpenseSchema = expenseSchema.omit({ id: true });

export type Expense = z.infer<typeof expenseSchema>;

// Router
export const expensesRoute = new Hono()
  // GET /api/expenses → list
  .get("/", (c) => ok(c, { expenses }))

  // GET /api/expenses/:id → single item
  // Enforce numeric id with a param regex (\\d+)
  .get("/:id{\\d+}", (c) => {
    const id = Number(c.req.param("id"));
    const item = expenses.find((e) => e.id === id);
    if (!item) return err(c, "Not found", 404);
    return ok(c, { expense: item });
  })

  // POST /api/expenses → create (validated)
  .post("/", zValidator("json", createExpenseSchema), (c) => {
    const data = c.req.valid("json"); // { title, amount }
    const nextId = (expenses.at(-1)?.id ?? 0) + 1;
    const created: Expense = { id: nextId, ...data };
    expenses.push(created);
    return ok(c, { expense: created }, 201);
  })

  // DELETE /api/expenses/:id → remove
  .delete("/:id{\\d+}", (c) => {
    const id = Number(c.req.param("id"));
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) return err(c, "Not found", 404);
    const [removed] = expenses.splice(idx, 1);
    return ok(c, { deleted: removed });
  });

// PUT /api/expenses/:id → full replace
expensesRoute.put(
  "/:id{\\d+}",
  zValidator("json", createExpenseSchema),
  (c) => {
    const id = Number(c.req.param("id"));
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) return err(c, "Not found", 404);

    const data = c.req.valid("json");
    if (Object.keys(data).length === 0) return err(c, "Invalid", 400);
    const updated: Expense = { id, ...data };
    expenses[idx] = updated;
    return ok(c, { expense: updated });
  }
);

// PATCH /api/expenses/:id → partial update
expensesRoute.patch(
  "/:id{\\d+}",
  zValidator("json", updateExpenseSchema),
  (c) => {
    const id = Number(c.req.param("id"));
    const idx = expenses.findIndex((e) => e.id === id);

    const data = c.req.valid("json");
    if (Object.keys(data).length === 0) return err(c, "Invalid", 400);
    const current = expenses[idx];
    if (idx === -1 || current === undefined) return err(c, "Not found", 404);
    const updated: Expense = { ...current, ...data };
    expenses[idx] = updated;
    return ok(c, { expense: updated });
  }
);
