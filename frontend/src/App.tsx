import { AppCard } from "./components/ui/AppCard";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold">COMP3330 – Frontend Setup</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vite • React • Tailwind • ShadCN
        </p>
        <AppCard />
      </div>
    </main>
  );
}
