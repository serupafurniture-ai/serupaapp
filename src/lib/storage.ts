/**
 * Akses localStorage yang aman: bisa gagal di mode privat, saat
 * pre-render di server, atau saat penyimpanan diblokir.
 */

export function readJson<T>(key: string, parse: (raw: unknown) => T | null): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Penyimpanan penuh atau diblokir: preferensi tetap berlaku di sesi ini saja.
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // abaikan
  }
}
