"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/features/auth/session-context";

/**
 * Menjaga halaman aplikasi: belum login → /login, belum pilih role → /pilih-role.
 * Catatan: ini kenyamanan UI. Perlindungan data yang sebenarnya ada di backend (RLS).
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const { state } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const needsLogin = state.status === "signed_out" || state.status === "needs_two_factor";
  const needsRole = state.status === "signed_in" && !state.activeRole && pathname !== "/pilih-role";

  useEffect(() => {
    if (needsLogin) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (needsRole) router.replace("/pilih-role");
  }, [needsLogin, needsRole, pathname, router]);

  if (state.status !== "signed_in" || needsRole) {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true" aria-live="polite">
        <span className="size-8 animate-spin rounded-full border-[3px] border-line-strong border-t-primary" />
        <span className="sr-only">Memuat…</span>
      </div>
    );
  }
  return <>{children}</>;
}
