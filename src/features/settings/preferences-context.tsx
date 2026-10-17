"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "@/features/auth/session-context";
import { DEFAULT_PREFERENCES, loadPreferences, savePreferences, type Preferences } from "./preferences";

type PreferencesContextValue = {
  prefs: Preferences;
  update: (next: Preferences) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function applyTheme(theme: Preferences["theme"]) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { state } = useSession();
  const userId = state.status === "signed_in" || state.status === "needs_two_factor" ? state.user.id : null;
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (userId) setPrefs(loadPreferences(userId));
  }, [userId]);

  useEffect(() => {
    applyTheme(prefs.theme);
    if (prefs.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [prefs.theme]);

  const update = useCallback(
    (next: Preferences) => {
      setPrefs(next);
      if (userId) savePreferences(userId, next);
    },
    [userId],
  );

  const value = useMemo(() => ({ prefs, update }), [prefs, update]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences harus dipakai di dalam <PreferencesProvider>");
  return ctx;
}
