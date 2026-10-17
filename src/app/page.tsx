"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/features/auth/session-context";

/** Titik masuk: arahkan sesuai status sesi. */
export default function Home() {
  const { state } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "loading") return;
    if (state.status !== "signed_in") router.replace("/login");
    else router.replace(state.activeRole ? "/beranda" : "/pilih-role");
  }, [state, router]);

  return <div className="min-h-dvh" aria-busy="true" />;
}
