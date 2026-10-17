import type { AppNotification, CustomerPayment, Delivery, Material, Order, Spk, User } from "./types";

/**
 * DATA CONTOH — bukan data nyata Serupa Furniture.
 * Dipakai selama NEXT_PUBLIC_DATA_SOURCE=mock. Semua akses lewat repository
 * di src/lib/data/repositories.ts supaya penggantian ke Supabase cukup di satu tempat.
 */

/** Password demo semua akun: "serupa123". Kode 2FA demo: "123456". */
export const DEMO_PASSWORD = "serupa123";
export const DEMO_OTP = "123456";

export const users: readonly User[] = [
  {
    id: "u-dina",
    name: "Dina Anggraini",
    email: "dina@serupafurniture.id",
    phone: "081288904417",
    roles: ["owner", "ppic", "keuangan"],
    requiresTwoFactor: true,
    isActive: true,
  },
  {
    id: "u-andi",
    name: "Andi Saputra",
    email: "andi@serupafurniture.id",
    phone: "081377120034",
    roles: ["ppic"],
    requiresTwoFactor: false,
    isActive: true,
  },
  {
    id: "u-rizky",
    name: "Rizky Pratama",
    email: "rizky@serupafurniture.id",
    phone: "081299001122",
    roles: ["marketing"],
    requiresTwoFactor: false,
    isActive: true,
  },
  {
    id: "u-darto",
    name: "Pak Darto",
    email: "darto@serupafurniture.id",
    phone: "085711223344",
    roles: ["produksi"],
    requiresTwoFactor: false,
    isActive: true,
  },
  {
    id: "u-lama",
    name: "Bayu (nonaktif)",
    email: "bayu@serupafurniture.id",
    phone: "081200000000",
    roles: ["gudang"],
    requiresTwoFactor: false,
    isActive: false,
  },
];

export const orders: readonly Order[] = [
  { number: "KO-021", customerName: "Ibu Sari", model: "Sofa L Minimalis", status: "dalam_produksi", estimatedDelivery: "2026-10-24" },
  { number: "KO-018", customerName: "Bpk. Yusuf", model: "Sofa L", status: "dalam_produksi", estimatedDelivery: "2026-10-21" },
  { number: "KO-074", customerName: "Ibu Maya", model: "Sofa 3 Dudukan", status: "dalam_produksi", estimatedDelivery: "2026-10-16" },
  { number: "KO-085", customerName: "Bpk. Hendra", model: "Sofa 3 Dudukan", status: "dalam_pengiriman", estimatedDelivery: "2026-10-18" },
  { number: "KO-092", customerName: "Rina Melati", model: "Sofa L Minimalis", status: "review_ppic", estimatedDelivery: "2026-11-07" },
];

export const spks: readonly Spk[] = [
  { number: "SPK-0021", version: 2, orderNumber: "KO-021", stage: "jahit", stageProgress: 60, completedStages: ["rangka", "busa"], assignee: "Pak Darto", targetDate: "2026-10-20" },
  { number: "SPK-0018", version: 1, orderNumber: "KO-018", stage: "finishing", stageProgress: 80, completedStages: ["rangka", "busa", "jahit"], assignee: "Pak Joko", targetDate: "2026-10-19" },
  { number: "SPK-0074", version: 1, orderNumber: "KO-074", stage: "finishing", stageProgress: 40, completedStages: ["rangka", "busa", "jahit"], assignee: "Pak Joko", targetDate: "2026-10-14" },
  { number: "SPK-0079", version: 1, orderNumber: "KO-079", stage: "jahit", stageProgress: 75, completedStages: ["rangka", "busa"], assignee: "Pak Darto", targetDate: "2026-10-16" },
];

export const materials: readonly Material[] = [
  { code: "BRG-014", name: "Kain Oscar Navy", unit: "m", stock: 3, minimum: 10, location: "Rak K2" },
  { code: "BRG-012", name: "Kain Oscar Grey", unit: "m", stock: 28, minimum: 10, location: "Rak K2" },
  { code: "BRG-022", name: "Busa D-32", unit: "lembar", stock: 2, minimum: 8, location: "Rak B1" },
  { code: "BRG-031", name: "Kaki stainless 12 cm", unit: "pcs", stock: 8, minimum: 24, location: "Rak A4" },
];

export const payments: readonly CustomerPayment[] = [
  { orderNumber: "KO-092", customerName: "Rina Melati", kind: "dp", amount: 5_000_000, status: "menunggu_verifikasi", paidAt: "2026-10-17T12:42:00Z" },
  { orderNumber: "KO-088", customerName: "Ibu Dewi", kind: "dp", amount: 4_000_000, status: "menunggu_verifikasi", paidAt: "2026-10-16T03:10:00Z" },
  { orderNumber: "KO-081", customerName: "Bpk. Rahmat", kind: "pelunasan", amount: 7_500_000, status: "terverifikasi", paidAt: "2026-10-18T03:10:00Z" },
];

export const deliveries: readonly Delivery[] = [
  { orderNumber: "KO-083", customerName: "Ibu Wulan", area: "Bekasi", team: "Tim 1", status: "terkendala", date: "2026-10-18", note: "Akses tangga sempit, dijadwalkan ulang" },
  { orderNumber: "KO-085", customerName: "Bpk. Hendra", area: "Jakarta Timur", team: "Tim 1", status: "dalam_perjalanan", date: "2026-10-18" },
  { orderNumber: "KO-086", customerName: "Siti Aisyah", area: "Depok", team: "Tim 1", status: "siap", date: "2026-10-18" },
];

export const notifications: readonly AppNotification[] = [
  {
    id: "n-1",
    kind: "approval",
    title: "Pengajuan belanja baru",
    body: "PB-2026-014 dari Rudi · Rp 3.540.000",
    createdAt: "2026-10-18T01:32:00Z",
    read: false,
    actionRequired: true,
    requires: "approval.decide",
  },
  {
    id: "n-2",
    kind: "pengiriman",
    title: "Pengiriman terkendala",
    body: "KO-083 · akses tangga sempit, dijadwalkan ulang",
    createdAt: "2026-10-18T01:10:00Z",
    read: false,
    actionRequired: true,
    requires: "delivery.read",
  },
  {
    id: "n-3",
    kind: "stok",
    title: "Stok kritis",
    body: "Kain Oscar Navy tinggal 3 m (minimum 10 m)",
    createdAt: "2026-10-18T00:45:00Z",
    read: false,
    actionRequired: false,
    requires: "inventory.read",
  },
  {
    id: "n-4",
    kind: "produksi",
    title: "SPK mendekati deadline",
    body: "SPK-0021 v2 · Jahit Kain 60% · target Sen, 20 Okt",
    createdAt: "2026-10-18T00:30:00Z",
    read: true,
    actionRequired: false,
    requires: "production.read",
  },
  {
    id: "n-5",
    kind: "qc",
    title: "QC lolos",
    body: "KO-085 siap kirim",
    createdAt: "2026-10-17T09:40:00Z",
    read: true,
    actionRequired: false,
    requires: "qc.read",
  },
  {
    id: "n-6",
    kind: "pembayaran",
    title: "Pembayaran masuk",
    body: "DP KO-092 Rp 5.000.000 menunggu verifikasi Keuangan",
    createdAt: "2026-10-17T12:45:00Z",
    read: false,
    actionRequired: true,
    requires: "finance.read",
  },
  {
    id: "n-7",
    kind: "order",
    title: "Order diajukan ke PPIC",
    body: "KO-092 · Rina Melati · Sofa L Minimalis",
    createdAt: "2026-10-17T14:10:00Z",
    read: true,
    actionRequired: false,
    requires: "order.read",
  },
];
