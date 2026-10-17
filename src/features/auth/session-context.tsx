"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import { isRole, type Role } from "@/features/roles/roles";
import { getRepository } from "@/lib/data/repositories";
import type { User } from "@/lib/data/types";
import { readJson, removeKey, writeJson } from "@/lib/storage";
import type { AuthService, SignInResult, StoredSession, VerifyResult } from "./auth-service";
import { createMockAuthService } from "./mock-auth-service";

const SESSION_KEY = "serupa.session.v1";

const storedSessionSchema = z.object({
  userId: z.string(),
  activeRole: z.string().nullable().transform((r) => (isRole(r) ? r : null)),
  verified: z.boolean(),
});

export type SessionState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "needs_two_factor"; user: User }
  | { status: "signed_in"; user: User; activeRole: Role | null };

type SessionContextValue = {
  state: SessionState;
  signIn: (identifier: string, password: string, remember: boolean) => Promise<SignInResult>;
  verifyTwoFactor: (code: string) => Promise<VerifyResult>;
  setActiveRole: (role: Role) => void;
  signOut: () => Promise<void>;
  auth: AuthService;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [auth] = useState<AuthService>(() => createMockAuthService());
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [remember, setRemember] = useState(true);

  const persist = useCallback(
    (session: StoredSession | null) => {
      if (!session) return removeKey(SESSION_KEY);
      // Tanpa "ingat perangkat", sesi hanya hidup selama tab terbuka (tidak ditulis ke storage).
      if (remember) writeJson(SESSION_KEY, session);
    },
    [remember],
  );

  // Pulihkan sesi saat aplikasi dibuka.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = readJson(SESSION_KEY, (raw) => storedSessionSchema.safeParse(raw).data ?? null);
      const user = stored ? await getRepository().getUser(stored.userId) : null;
      if (cancelled) return;
      if (!stored || !user || !user.isActive) return setState({ status: "signed_out" });
      if (!stored.verified) return setState({ status: "needs_two_factor", user });
      const activeRole = stored.activeRole && user.roles.includes(stored.activeRole) ? stored.activeRole : null;
      setState({ status: "signed_in", user, activeRole });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback<SessionContextValue["signIn"]>(
    async (identifier, password, rememberDevice) => {
      setRemember(rememberDevice);
      const result = await auth.signIn(identifier, password);
      if (!result.ok) return result;
      const { user, needsTwoFactor } = result;
      // Role tunggal langsung aktif; banyak role → pilih di layar Pilih Role.
      const activeRole = user.roles.length === 1 ? (user.roles[0] ?? null) : null;
      if (rememberDevice) writeJson(SESSION_KEY, { userId: user.id, activeRole, verified: !needsTwoFactor } satisfies StoredSession);
      setState(needsTwoFactor ? { status: "needs_two_factor", user } : { status: "signed_in", user, activeRole });
      return result;
    },
    [auth],
  );

  const verifyTwoFactor = useCallback<SessionContextValue["verifyTwoFactor"]>(
    async (code) => {
      if (state.status !== "needs_two_factor") return { ok: false, error: "invalid_code" };
      const result = await auth.verifyTwoFactor(state.user.id, code);
      if (result.ok) {
        const activeRole = state.user.roles.length === 1 ? (state.user.roles[0] ?? null) : null;
        persist({ userId: state.user.id, activeRole, verified: true });
        setState({ status: "signed_in", user: state.user, activeRole });
      }
      return result;
    },
    [auth, persist, state],
  );

  const setActiveRole = useCallback(
    (role: Role) => {
      if (state.status !== "signed_in" || !state.user.roles.includes(role)) return;
      persist({ userId: state.user.id, activeRole: role, verified: true });
      setState({ ...state, activeRole: role });
    },
    [persist, state],
  );

  const signOut = useCallback(async () => {
    await auth.signOut();
    persist(null);
    setState({ status: "signed_out" });
  }, [auth, persist]);

  const value = useMemo(
    () => ({ state, signIn, verifyTwoFactor, setActiveRole, signOut, auth }),
    [state, signIn, verifyTwoFactor, setActiveRole, signOut, auth],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession harus dipakai di dalam <SessionProvider>");
  return ctx;
}

/** Untuk halaman yang hanya tampil setelah login & role dipilih (dijaga oleh AppShell). */
export function useSignedInSession() {
  const { state, ...rest } = useSession();
  if (state.status !== "signed_in" || !state.activeRole) {
    throw new Error("useSignedInSession dipanggil sebelum sesi siap");
  }
  return { user: state.user, role: state.activeRole, ...rest };
}
