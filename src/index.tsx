import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AdminApp } from "@/admin/AdminApp";

// Minimal path-based routing: /admin loads the backoffice, everything else
// loads the public site. Keeps a single Vite entry (no router dependency).
const isAdmin = window.location.pathname.replace(/\/+$/, "").endsWith("/admin");

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>{isAdmin ? <AdminApp /> : <App />}</React.StrictMode>,
);

// Register the service worker for offline support & installability (PWA).
// Only in production builds — in dev it would intercept Vite's module graph
// and HMR requests, which can leave the page stuck loading.
if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        /* ignore registration errors (e.g. unsupported / insecure context) */
      });
    });
  } else {
    // Dev: make sure no previously-installed SW (from an earlier build)
    // keeps controlling the page and serving stale cached assets.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }
}
