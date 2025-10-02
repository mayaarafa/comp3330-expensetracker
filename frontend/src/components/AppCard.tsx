import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function AppCard() {
  return (
    <Card className="mt-6 font-mono">
      <CardHeader>
        <CardTitle>Frontend Ready</CardTitle>
        <CardDescription>
          Vite + React + Tailwind + ShadCN is configured.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Next lab: connect to your backend and render real data.
        </p>
      </CardContent>
    </Card>
  );
}
