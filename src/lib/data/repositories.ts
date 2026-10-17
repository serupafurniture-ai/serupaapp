import * as db from "./mock-db";
import type { AppNotification, CustomerPayment, Delivery, Material, Order, Spk, User } from "./types";

/**
 * Kontrak akses data. Implementasi mock di bawah; implementasi Supabase
 * (Fase 1) cukup memenuhi interface yang sama, tanpa mengubah UI.
 */
export interface DataRepository {
  findUserByIdentifier(identifier: string): Promise<User | null>;
  getUser(id: string): Promise<User | null>;
  findOrder(number: string): Promise<Order | null>;
  findSpkForOrder(orderNumber: string): Promise<Spk | null>;
  listLateSpk(today: string): Promise<Spk[]>;
  searchMaterials(query: string): Promise<Material[]>;
  listPendingPayments(): Promise<CustomerPayment[]>;
  listDeliveries(date: string): Promise<Delivery[]>;
  listNotifications(): Promise<AppNotification[]>;
}

const normalize = (s: string) => s.trim().toLowerCase();
const digitsOnly = (s: string) => s.replace(/\D/g, "");

export const mockRepository: DataRepository = {
  async findUserByIdentifier(identifier) {
    const id = normalize(identifier);
    const phone = digitsOnly(identifier);
    return (
      db.users.find((u) => u.email === id || (phone.length >= 8 && digitsOnly(u.phone) === phone.replace(/^62/, "0"))) ?? null
    );
  },

  async getUser(id) {
    return db.users.find((u) => u.id === id) ?? null;
  },

  async findOrder(number) {
    return db.orders.find((o) => o.number === number.toUpperCase()) ?? null;
  },

  async findSpkForOrder(orderNumber) {
    return db.spks.find((s) => s.orderNumber === orderNumber.toUpperCase()) ?? null;
  },

  async listLateSpk(today) {
    return db.spks.filter((s) => s.targetDate < today).sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  },

  async searchMaterials(query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    return db.materials.filter((m) => words.every((w) => normalize(m.name).includes(w)));
  },

  async listPendingPayments() {
    return db.payments.filter((p) => p.status === "menunggu_verifikasi");
  },

  async listDeliveries(date) {
    return db.deliveries.filter((d) => d.date === date);
  },

  async listNotifications() {
    return [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

/** Satu titik pemilihan sumber data. */
export function getRepository(): DataRepository {
  // Saat NEXT_PUBLIC_DATA_SOURCE=supabase, kembalikan supabaseRepository di sini (Fase 1).
  return mockRepository;
}
