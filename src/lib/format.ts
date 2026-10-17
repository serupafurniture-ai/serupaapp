/**
 * Format angka & waktu (Blueprint §2.11): uang disimpan sebagai bilangan
 * bulat rupiah, semua waktu ditampilkan dalam WIB.
 */

export const TIME_ZONE = "Asia/Jakarta";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new RangeError(`Nominal harus bilangan bulat rupiah, dapat: ${amount}`);
  }
  // Intl menyisipkan spasi tak-putus; disamakan ke spasi biasa untuk konsistensi tampilan.
  return rupiahFormatter.format(amount).replace(/ /g, " ");
}

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "Sabtu, 18 Okt 2026 · 08.40 WIB" */
export function formatDateTimeWib(date: Date): string {
  const parts = dateTimeFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")} · ${get("hour")}.${get("minute")} WIB`;
}

/** "08.40" */
export function formatTimeWib(date: Date): string {
  return timeFormatter.format(date).replace(":", ".");
}

/** Kunci hari kalender WIB, mis. "2026-10-18". */
export function wibDayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

/** Label grup untuk daftar: "Hari ini", "Kemarin", atau tanggal. */
export function relativeDayLabel(date: Date, now: Date = new Date()): string {
  const day = wibDayKey(date);
  if (day === wibDayKey(now)) return "Hari ini";
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (day === wibDayKey(yesterday)) return "Kemarin";
  return new Intl.DateTimeFormat("id-ID", { timeZone: TIME_ZONE, day: "numeric", month: "long" }).format(date);
}

/** Sapaan sesuai jam WIB. */
export function greeting(date: Date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", hour12: false }).format(date));
  if (hour < 4) return "Selamat malam";
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
