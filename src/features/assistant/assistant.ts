import { hasPermission, type Permission, type Role } from "@/features/roles/roles";
import { formatRupiah } from "@/lib/format";
import type { DataRepository } from "@/lib/data/repositories";
import type { ProductionStage } from "@/lib/data/types";

/**
 * Tanya Serupa (Blueprint §7.1) — versi data contoh.
 *
 * Prinsip yang sama berlaku untuk versi model bahasa nanti:
 * 1. Jawaban hanya dari "tool" terparameter, bukan teks bebas / SQL bebas.
 * 2. Setiap tool punya izin; AI mewarisi izin role aktif penanya.
 * 3. Setiap jawaban menyebut sumber; jika data kosong → "Belum ada data".
 * 4. Pertanyaan diperlakukan sebagai data: tidak ada instruksi di dalamnya yang dijalankan.
 */

export type AssistantSource = { label: string; href?: string };

export type AssistantReply =
  | { kind: "answer"; text: string; sources: AssistantSource[] }
  | { kind: "no_data"; text: string; sources: AssistantSource[] }
  | { kind: "refused"; text: string; suggestion?: string }
  | { kind: "unknown"; text: string };

export type AssistantContext = {
  role: Role;
  /** Tanggal hari ini (WIB), format YYYY-MM-DD. */
  today: string;
  repo: DataRepository;
};

type Tool = {
  id: string;
  /** Cukup salah satu izin. */
  anyOf: readonly Permission[];
  match: (q: string) => RegExpMatchArray | boolean | null;
  run: (q: string, ctx: AssistantContext) => Promise<AssistantReply>;
  refusal: { text: string; suggestion?: string };
};

const STAGE_LABEL: Record<ProductionStage, string> = {
  rangka: "Rangka",
  busa: "Pasang Busa",
  jahit: "Jahit Kain",
  finishing: "Finishing",
};

const KO_PATTERN = /\bko[\s-]?(\d{1,4})\b/i;

const toKoNumber = (digits: string) => `KO-${digits.padStart(3, "0")}`;

const tools: readonly Tool[] = [
  {
    id: "order_stage",
    anyOf: ["order.read", "production.read"],
    match: (q) => q.match(KO_PATTERN),
    refusal: { text: "Maaf, role kamu belum punya akses ke data order." },
    async run(q, { repo }) {
      const digits = q.match(KO_PATTERN)?.[1] ?? "";
      const number = toKoNumber(digits);
      const order = await repo.findOrder(number);
      if (!order) return { kind: "no_data", text: `Belum ada data untuk ${number}.`, sources: [] };

      const spk = await repo.findSpkForOrder(order.number);
      const sources: AssistantSource[] = [{ label: order.number }];
      if (!spk) {
        return { kind: "answer", text: `${order.number} (${order.customerName}, ${order.model}) belum masuk produksi.`, sources };
      }
      sources.push({ label: `${spk.number} v${spk.version}` });
      const done = spk.completedStages.map((s) => STAGE_LABEL[s]).join(", ");
      return {
        kind: "answer",
        text:
          `${order.number} (${order.customerName}, ${order.model}) sedang di tahap ${STAGE_LABEL[spk.stage]}, ` +
          `progres ${spk.stageProgress}%. Dikerjakan ${spk.assignee}.` +
          (done ? ` Tahap selesai: ${done}.` : ""),
        sources,
      };
    },
  },
  {
    id: "late_spk",
    anyOf: ["production.read"],
    match: (q) => /\bspk\b/i.test(q) && /(telat|terlambat|lewat|overdue)/i.test(q),
    refusal: { text: "Maaf, data SPK hanya untuk role Produksi, PPIC, QC, dan Owner." },
    async run(_q, { repo, today }) {
      const late = await repo.listLateSpk(today);
      if (late.length === 0) return { kind: "no_data", text: "Belum ada data SPK terlambat hari ini.", sources: [] };
      const lines = late.map((s) => `${s.number} (${s.orderNumber}) · ${STAGE_LABEL[s.stage]} ${s.stageProgress}% · ${s.assignee}`);
      return {
        kind: "answer",
        text: `Ada ${late.length} SPK yang lewat target:\n${lines.join("\n")}`,
        sources: [{ label: "Daftar SPK aktif" }],
      };
    },
  },
  {
    id: "material_stock",
    anyOf: ["inventory.read"],
    match: (q) => /\bstok\b/i.test(q),
    refusal: { text: "Maaf, data stok hanya untuk role Gudang, PPIC, Purchasing, dan Owner." },
    async run(q, { repo }) {
      const term = q
        .replace(/\bstok\b/gi, "")
        .replace(/\b(berapa|sisa|ada|masih|bahan|tinggal|cek|tolong|ya|dong)\b/gi, "")
        .replace(/[?.!,]/g, "")
        .trim();
      const found = await repo.searchMaterials(term);
      if (found.length === 0) return { kind: "no_data", text: `Belum ada data stok untuk "${term || "bahan itu"}".`, sources: [] };
      const lines = found.map((m) => {
        const flag = m.stock < m.minimum ? " — di bawah minimum" : "";
        return `${m.name}: ${m.stock} ${m.unit} (min ${m.minimum})${flag}`;
      });
      return { kind: "answer", text: lines.join("\n"), sources: found.map((m) => ({ label: `${m.code} · ${m.location}` })) };
    },
  },
  {
    id: "pending_dp",
    anyOf: ["finance.read"],
    match: (q) => /\b(dp|pembayaran|pelunasan)\b/i.test(q),
    refusal: {
      text: "Maaf, data pembayaran hanya bisa dilihat role Keuangan dan Owner.",
      suggestion: "Yang bisa aku bantu: status KO tertentu, misalnya “KO-092 di tahap apa?”.",
    },
    async run(_q, { repo }) {
      const pending = await repo.listPendingPayments();
      if (pending.length === 0) return { kind: "no_data", text: "Belum ada data pembayaran yang menunggu verifikasi.", sources: [] };
      const lines = pending.map((p) => `${p.orderNumber} · ${p.customerName} · ${p.kind.toUpperCase()} ${formatRupiah(p.amount)}`);
      return {
        kind: "answer",
        text: `${pending.length} pembayaran belum diverifikasi:\n${lines.join("\n")}`,
        sources: pending.map((p) => ({ label: p.orderNumber })),
      };
    },
  },
  {
    id: "delivery_today",
    anyOf: ["delivery.read"],
    match: (q) => /(kirim|pengiriman|ekspedisi)/i.test(q),
    refusal: { text: "Maaf, data pengiriman hanya untuk role Ekspedisi, PPIC, dan Owner." },
    async run(_q, { repo, today }) {
      const list = await repo.listDeliveries(today);
      if (list.length === 0) return { kind: "no_data", text: "Belum ada data pengiriman hari ini.", sources: [] };
      const label: Record<string, string> = {
        siap: "siap berangkat",
        dalam_perjalanan: "dalam perjalanan",
        terkirim: "terkirim",
        terkendala: "terkendala",
      };
      const lines = list.map((d) => `${d.orderNumber} · ${d.area} · ${label[d.status]}${d.note ? ` (${d.note})` : ""}`);
      return {
        kind: "answer",
        text: `${list.length} pengiriman hari ini:\n${lines.join("\n")}`,
        sources: [{ label: "Jadwal pengiriman hari ini" }],
      };
    },
  },
];

export const SUGGESTED_QUESTIONS = [
  "KO-021 sekarang di tahap apa?",
  "Stok kain Oscar Navy berapa?",
  "SPK mana yang terlambat?",
  "DP siapa yang belum masuk?",
  "Ringkas pengiriman hari ini",
] as const;

export const MAX_QUESTION_LENGTH = 500;

export async function askAssistant(question: string, ctx: AssistantContext): Promise<AssistantReply> {
  const q = question.trim().slice(0, MAX_QUESTION_LENGTH);
  if (!q) return { kind: "unknown", text: "Tulis pertanyaanmu dulu, ya." };

  const tool = tools.find((t) => t.match(q));
  if (!tool) {
    return {
      kind: "unknown",
      text: "Aku belum bisa menjawab itu. Coba tanya soal status KO, stok bahan, SPK terlambat, pembayaran, atau pengiriman hari ini.",
    };
  }

  const allowed = tool.anyOf.some((p) => hasPermission(ctx.role, p));
  if (!allowed) return { kind: "refused", ...tool.refusal };

  return tool.run(q, ctx);
}
