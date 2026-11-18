import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router";
import { App } from "./App";
import { StoreProvider } from "./demo/store";
import { keepAddressBar } from "./lib/mode";
import "./index.css";

const Router = keepAddressBar ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Router>
  </StrictMode>,
);
