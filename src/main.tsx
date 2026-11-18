import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import Screen from "./pages/Screen.tsx";
import Join from "./pages/Join.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// "/" = projector (and host controls). "/join" = players' phones (the QR code opens this).
const path = location.pathname.replace(/\/+$/, "");
const Page = path === "/join" ? Join : Screen;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Page />
    </ErrorBoundary>
  </StrictMode>,
);
