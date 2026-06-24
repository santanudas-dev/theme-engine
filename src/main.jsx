import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "tailwind-theme-provider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider themes={["light", "dark"]}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
