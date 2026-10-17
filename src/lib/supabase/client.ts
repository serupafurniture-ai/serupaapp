import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env";

/**
 * Klien Supabase untuk browser (Fase 1). Belum dipakai selama DATA_SOURCE=mock.
 * Anon key aman di klien karena semua tabel dilindungi Row Level Security
 * (lihat supabase/migrations). Kunci service_role TIDAK PERNAH boleh ada di sini.
 */
export function createSupabaseBrowserClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
