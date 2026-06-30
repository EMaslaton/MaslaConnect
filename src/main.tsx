import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

// Limpiar localStorage si está lleno (evitar QuotaExceeded)
try {
  localStorage.setItem("__test", "1");
  localStorage.removeItem("__test");
} catch (e) {
  console.warn("⚠️ localStorage lleno, limpiando imágenes grandes...");
  // Si localStorage está lleno, limpiar datos no esenciales
  const keysToDelete = Object.keys(localStorage).filter(
    (key) => key.startsWith("service_images_") || key === "service-store"
  );
  keysToDelete.forEach((key) => localStorage.removeItem(key));
  console.log(`🧹 Removed ${keysToDelete.length} cache items`);
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
