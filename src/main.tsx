import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import Screen from "./pages/Screen.tsx";
import Join from "./pages/Join.tsx";
import App from "./app/App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// "/" = projector (and host controls). "/join" = players' phones (the QR code opens this).
// "/play…" = the Quality Games app (solo, rooms with friends, high scores).
const path = location.pathname.replace(/\/+$/, "");
const Page = path === "/join" ? Join : path === "/play" || path.startsWith("/play/") ? App : Screen;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Page />
    </ErrorBoundary>
  </StrictMode>,
);

// The app works offline once opened, and can be installed ("Add to Home Screen"). Not in the emulator test setup.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
