// server/index.ts
import { app } from "./app";

// Prefer PORT from env; default 3000
const port = Number(process.env.PORT || 3000);

export default {
  port,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${port}`);
