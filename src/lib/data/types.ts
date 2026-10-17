import type { Permission, Role } from "@/features/roles/roles";

/** Model data ringkas untuk fase Umum. Mengikuti Blueprint §9; field lain menyusul per modul. */

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: readonly Role[];
  /** Owner wajib verifikasi 2 langkah (Blueprint §6.1, §14). */
  requiresTwoFactor: boolean;
  isActive: boolean;
};

export type ProductionStage = "rangka" | "busa" | "jahit" | "finishing";

export type OrderStatus =
  | "draft"
  | "menunggu_konfirmasi"
  | "terkonfirmasi"
  | "review_ppic"
  | "menunggu_material"
  | "siap_produksi"
  | "dalam_produksi"
  | "menunggu_qc"
  | "siap_kirim"
  | "dalam_pengiriman"
  | "terkirim"
  | "selesai"
  | "hold"
  | "dibatalkan";

export type Order = {
  number: string; // KO-021
  customerName: string;
  model: string;
  status: OrderStatus;
  estimatedDelivery: string; // ISO date
};

export type Spk = {
  number: string; // SPK-0021
  version: number;
  orderNumber: string;
  stage: ProductionStage;
  stageProgress: number; // 0–100
  completedStages: readonly ProductionStage[];
  assignee: string;
  targetDate: string; // ISO date
};

export type Material = {
  code: string; // BRG-014
  name: string;
  unit: string;
  stock: number;
  minimum: number;
  location: string;
};

export type CustomerPayment = {
  orderNumber: string;
  customerName: string;
  kind: "dp" | "pelunasan";
  amount: number; // rupiah, bilangan bulat
  status: "menunggu_verifikasi" | "terverifikasi" | "ditolak";
  paidAt: string; // ISO datetime
};

export type Delivery = {
  orderNumber: string;
  customerName: string;
  area: string;
  team: string;
  status: "siap" | "dalam_perjalanan" | "terkirim" | "terkendala";
  date: string; // ISO date
  note?: string;
};

export type NotificationKind = "order" | "produksi" | "qc" | "stok" | "approval" | "pembayaran" | "pesan" | "pengiriman";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string; // ISO datetime
  read: boolean;
  actionRequired: boolean;
  /** Notifikasi hanya tampil untuk role yang punya izin ini. */
  requires: Permission;
};
