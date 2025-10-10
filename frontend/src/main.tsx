import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./router";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>
);
