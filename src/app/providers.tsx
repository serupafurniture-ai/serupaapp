"use client";

import { useEffect, type ReactNode } from "react";
import { SessionProvider } from "@/features/auth/session-context";
import { PreferencesProvider } from "@/features/settings/preferences-context";

function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA tetap jalan tanpa cache offline.
    });
  }, []);
}

export function Providers({ children }: { children: ReactNode }) {
  useServiceWorker();
  return (
    <SessionProvider>
      <PreferencesProvider>{children}</PreferencesProvider>
    </SessionProvider>
  );
}
