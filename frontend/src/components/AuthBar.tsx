// /frontend/src/components/AuthBar.tsx
import * as React from "react";

export function AuthBar() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm">
      {user ? (
        <>
          <span className="text-muted-foreground">
            {user.email ?? user.sub}
          </span>
          <a
            className="rounded bg-primary px-3 py-1 text-primary-foreground"
            href="/api/auth/logout"
          >
            Logout
          </a>
        </>
      ) : (
        <a
          className="rounded bg-primary px-3 py-1 text-primary-foreground"
          href="/api/auth/login"
        >
          Login
        </a>
      )}
    </div>
  );
}
