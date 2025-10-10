import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  useParams,
} from "@tanstack/react-router";
import App from "./App";
import ExpenseNewPage from "./routes/expenses.new";
import ExpensesListPage from "./routes/expenses.list";
import ExpenseDetailPage from "./routes/expenses.detail";

const rootRoute = createRootRoute({
  component: () => <App />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <p>Home Page</p>,
});

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: () => <ExpensesListPage />,
});

const newExpenseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses/new",
  component: () => <ExpenseNewPage />,
});

const expensesDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses/$id",
  component: () => {
    const { id } = useParams({ from: expensesDetailRoute.id });
    return <ExpenseDetailPage id={Number(id)} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  expensesRoute,
  newExpenseRoute,
  expensesDetailRoute,
]);

export const router = createRouter({ routeTree });

router.update({
  defaultNotFoundComponent: () => <p>Page not found</p>,
  defaultErrorComponent: ({ error }) => (
    <p>Error: {(error as Error).message}</p>
  ),
});

export function AppRouter() {
  return <RouterProvider router={router} />;
}
