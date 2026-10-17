import { describe, expect, it } from "vitest";
import { formatRupiah, formatTimeWib, greeting, initialsOf, relativeDayLabel, wibDayKey } from "./format";

describe("format", () => {
  it("memformat rupiah tanpa desimal", () => {
    expect(formatRupiah(3540000)).toBe("Rp 3.540.000");
  });

  it("menolak nominal pecahan", () => {
    expect(() => formatRupiah(10.5)).toThrow(RangeError);
  });

  it("menampilkan jam dalam WIB walau input UTC", () => {
    expect(formatTimeWib(new Date("2026-10-18T01:40:00Z"))).toBe("08.40");
  });

  it("hari kalender mengikuti WIB, bukan UTC", () => {
    // 18:30 UTC tanggal 17 = 01:30 WIB tanggal 18
    expect(wibDayKey(new Date("2026-10-17T18:30:00Z"))).toBe("2026-10-18");
  });

  it("label hari relatif", () => {
    const now = new Date("2026-10-18T03:00:00Z");
    expect(relativeDayLabel(new Date("2026-10-18T01:00:00Z"), now)).toBe("Hari ini");
    expect(relativeDayLabel(new Date("2026-10-17T05:00:00Z"), now)).toBe("Kemarin");
  });

  it("sapaan mengikuti jam WIB", () => {
    expect(greeting(new Date("2026-10-18T01:00:00Z"))).toBe("Selamat pagi");
    expect(greeting(new Date("2026-10-18T13:00:00Z"))).toBe("Selamat malam");
    expect(greeting(new Date("2026-10-17T19:15:00Z"))).toBe("Selamat malam"); // 02.15 WIB
  });

  it("inisial nama", () => {
    expect(initialsOf("Dina Anggraini")).toBe("DA");
    expect(initialsOf("Pak Darto Wibowo")).toBe("PD");
  });
});
