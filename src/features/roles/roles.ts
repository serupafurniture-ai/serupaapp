/**
 * Role & izin (Blueprint §5).
 *
 * Aturan:
 * - Izin divalidasi di backend; di klien ini hanya untuk menampilkan menu
 *   dan memberi penolakan yang sopan. Saat beralih ke Supabase, aturan yang
 *   sama ditegakkan oleh Row Level Security.
 * - Satu pengguna boleh punya lebih dari satu role; yang berlaku adalah role aktif.
 */

export const ROLES = [
  "owner",
  "marketing",
  "ppic",
  "purchasing",
  "gudang",
  "produksi",
  "qc",
  "ekspedisi",
  "keuangan",
  "viewer",
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "order.read",
  "order.write",
  "production.read",
  "production.write",
  "inventory.read",
  "purchasing.read",
  "qc.read",
  "delivery.read",
  "finance.read",
  "marketing.read",
  "approval.decide",
  "report.read",
  "settings.admin",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

type RoleDefinition = {
  label: string;
  /** Ringkasan tanggung jawab, tampil di layar Pilih Role. */
  summary: string;
  permissions: readonly Permission[];
};

const ALL_PERMISSIONS = PERMISSIONS;

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  owner: {
    label: "Owner / Super Admin",
    summary: "Semua modul, approval, laporan",
    permissions: ALL_PERMISSIONS,
  },
  marketing: {
    label: "Marketing",
    summary: "Lead, inbox, penawaran, buat KO",
    permissions: ["order.read", "order.write", "marketing.read"],
  },
  ppic: {
    label: "PPIC",
    summary: "Review KO, jadwal, HOLD, SPK",
    permissions: ["order.read", "production.read", "production.write", "inventory.read", "qc.read", "delivery.read"],
  },
  purchasing: {
    label: "Purchasing",
    summary: "Pengajuan belanja, PO, supplier",
    permissions: ["purchasing.read", "inventory.read"],
  },
  gudang: {
    label: "Gudang",
    summary: "Stok, barang masuk/keluar, opname",
    permissions: ["inventory.read", "purchasing.read"],
  },
  produksi: {
    label: "Produksi / Tukang",
    summary: "SPK yang ditugaskan, progres, kendala",
    permissions: ["production.read"],
  },
  qc: {
    label: "QC",
    summary: "Checklist, hasil, rework, laporan QC",
    permissions: ["qc.read", "production.read"],
  },
  ekspedisi: {
    label: "Ekspedisi",
    summary: "Tugas kirim, rute, bukti, pengeluaran",
    permissions: ["delivery.read"],
  },
  keuangan: {
    label: "Keuangan",
    summary: "Transaksi, verifikasi bayar, saldo",
    permissions: ["finance.read", "order.read", "report.read"],
  },
  viewer: {
    label: "Viewer / Manager",
    summary: "Baca terbatas",
    permissions: ["order.read", "report.read"],
  },
};

export function roleLabel(role: Role): string {
  return ROLE_DEFINITIONS[role].label;
}

/** Label pendek untuk chip di header (maks ±10 karakter). */
export function roleShortLabel(role: Role): string {
  const short: Record<Role, string> = {
    owner: "Owner",
    marketing: "Marketing",
    ppic: "PPIC",
    purchasing: "Purchasing",
    gudang: "Gudang",
    produksi: "Tukang",
    qc: "QC",
    ekspedisi: "Driver",
    keuangan: "Keuangan",
    viewer: "Viewer",
  };
  return short[role];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_DEFINITIONS[role].permissions.includes(permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
