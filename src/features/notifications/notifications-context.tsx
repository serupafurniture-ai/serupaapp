"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "@/features/auth/session-context";
import { usePreferences } from "@/features/settings/preferences-context";
import { getRepository } from "@/lib/data/repositories";
import type { AppNotification } from "@/lib/data/types";
import { readJson, writeJson } from "@/lib/storage";
import { unreadCount, visibleNotifications } from "./notifications";

const readKey = (userId: string) => `serupa.notif-read.v1.${userId}`;

type NotificationsContextValue = {
  items: AppNotification[];
  unread: number;
  markRead: (ids: readonly string[]) => void;
  markAllRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/** Satu sumber untuk badge lonceng di header dan halaman Notifikasi. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { state } = useSession();
  const { prefs } = usePreferences();
  const userId = state.status === "signed_in" ? state.user.id : null;
  const role = state.status === "signed_in" ? state.activeRole : null;

  const [all, setAll] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    getRepository()
      .listNotifications()
      .then((list) => alive && setAll(list));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const ids = readJson(readKey(userId), (raw) =>
      Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : null,
    );
    setReadIds(new Set(ids ?? []));
  }, [userId]);

  const items = useMemo(() => (role ? visibleNotifications(all, role, prefs, readIds) : []), [all, role, prefs, readIds]);

  const markRead = useCallback(
    (ids: readonly string[]) => {
      if (!userId) return;
      setReadIds((prev) => {
        const next = new Set([...prev, ...ids]);
        writeJson(readKey(userId), [...next]);
        return next;
      });
    },
    [userId],
  );

  const markAllRead = useCallback(() => markRead(items.map((n) => n.id)), [items, markRead]);

  const value = useMemo(() => ({ items, unread: unreadCount(items), markRead, markAllRead }), [items, markRead, markAllRead]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications harus dipakai di dalam <NotificationsProvider>");
  return ctx;
}
