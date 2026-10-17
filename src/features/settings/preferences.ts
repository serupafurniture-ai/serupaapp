import { z } from "zod";
import type { Role } from "@/features/roles/roles";
import type { NotificationKind } from "@/lib/data/types";
import { readJson, writeJson } from "@/lib/storage";

export const THEMES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEMES)[number];

export const NOTIFICATION_KINDS: readonly { kind: NotificationKind; label: string }[] = [
  { kind: "order", label: "Order baru & perubahan order" },
  { kind: "approval", label: "Pengajuan & hasil approval" },
  { kind: "produksi", label: "Penugasan & status produksi" },
  { kind: "qc", label: "Hasil QC & rework" },
  { kind: "stok", label: "Stok kritis" },
  { kind: "pembayaran", label: "Pembayaran & jatuh tempo" },
  { kind: "pengiriman", label: "Pengiriman terkendala" },
  { kind: "pesan", label: "Pesan omnichannel baru" },
];

const kindSchema = z.enum(["order", "produksi", "qc", "stok", "approval", "pembayaran", "pesan", "pengiriman"]);

const preferencesSchema = z.object({
  theme: z.enum(THEMES).catch("system"),
  /** Notifikasi yang DIMATIKAN, per role. Default semua menyala. */
  mutedByRole: z.record(z.string(), z.array(kindSchema)).catch({}),
});

export type Preferences = z.infer<typeof preferencesSchema>;

export const DEFAULT_PREFERENCES: Preferences = { theme: "system", mutedByRole: {} };

export const THEME_STORAGE_KEY = "serupa.theme";
const prefsKey = (userId: string) => `serupa.prefs.v1.${userId}`;

export function loadPreferences(userId: string): Preferences {
  return readJson(prefsKey(userId), (raw) => preferencesSchema.safeParse(raw).data ?? null) ?? DEFAULT_PREFERENCES;
}

export function savePreferences(userId: string, prefs: Preferences): void {
  writeJson(prefsKey(userId), prefs);
  // Disimpan terpisah agar skrip anti-kedip di <head> bisa membacanya sebelum React jalan.
  writeJson(THEME_STORAGE_KEY, prefs.theme);
}

export function isMuted(prefs: Preferences, role: Role, kind: NotificationKind): boolean {
  return prefs.mutedByRole[role]?.includes(kind) ?? false;
}

export function toggleMuted(prefs: Preferences, role: Role, kind: NotificationKind): Preferences {
  const current = prefs.mutedByRole[role] ?? [];
  const next = current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind];
  return { ...prefs, mutedByRole: { ...prefs.mutedByRole, [role]: next } };
}
