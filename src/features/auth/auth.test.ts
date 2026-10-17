import { describe, expect, it } from "vitest";
import { DEMO_OTP, DEMO_PASSWORD } from "@/lib/data/mock-db";
import { createMockAuthService } from "./mock-auth-service";
import { changePasswordSchema, passwordSchema } from "./password-policy";

describe("autentikasi (data contoh)", () => {
  it("login dengan email atau nomor HP", async () => {
    const auth = createMockAuthService();
    const byEmail = await auth.signIn("Dina@SerupaFurniture.id ", DEMO_PASSWORD);
    const byPhone = await auth.signIn("+62 813-7712-0034", DEMO_PASSWORD);
    expect(byEmail.ok && byEmail.user.id).toBe("u-dina");
    expect(byPhone.ok && byPhone.user.id).toBe("u-andi");
  });

  it("owner wajib 2FA, role lain tidak", async () => {
    const auth = createMockAuthService();
    const owner = await auth.signIn("dina@serupafurniture.id", DEMO_PASSWORD);
    const ppic = await auth.signIn("andi@serupafurniture.id", DEMO_PASSWORD);
    expect(owner.ok && owner.needsTwoFactor).toBe(true);
    expect(ppic.ok && ppic.needsTwoFactor).toBe(false);
    expect(await auth.verifyTwoFactor("u-dina", DEMO_OTP)).toEqual({ ok: true });
    expect(await auth.verifyTwoFactor("u-dina", "000000")).toEqual({ ok: false, error: "invalid_code" });
  });

  it("pesan error tidak membocorkan apakah akun ada", async () => {
    const auth = createMockAuthService();
    expect(await auth.signIn("tidakada@serupafurniture.id", DEMO_PASSWORD)).toEqual({ ok: false, error: "invalid_credentials" });
    expect(await auth.signIn("andi@serupafurniture.id", "salah123")).toEqual({ ok: false, error: "invalid_credentials" });
  });

  it("akun nonaktif ditolak", async () => {
    const auth = createMockAuthService();
    expect(await auth.signIn("bayu@serupafurniture.id", DEMO_PASSWORD)).toEqual({ ok: false, error: "inactive" });
  });

  it("dikunci setelah 5 kali gagal", async () => {
    const auth = createMockAuthService();
    for (let i = 0; i < 5; i++) await auth.signIn("andi@serupafurniture.id", "salah123");
    expect(await auth.signIn("andi@serupafurniture.id", DEMO_PASSWORD)).toEqual({ ok: false, error: "too_many_attempts" });
  });

  it("ganti password", async () => {
    const auth = createMockAuthService();
    expect(await auth.changePassword("u-andi", "salah", "baru12345")).toEqual({ ok: false, error: "wrong_password" });
    expect(await auth.changePassword("u-andi", DEMO_PASSWORD, "baru12345")).toEqual({ ok: true });
    const relogin = await auth.signIn("andi@serupafurniture.id", "baru12345");
    expect(relogin.ok).toBe(true);
  });
});

describe("aturan password", () => {
  it("minimal 8 karakter, huruf dan angka", () => {
    expect(passwordSchema.safeParse("abc12345").success).toBe(true);
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
    expect(passwordSchema.safeParse("ab12").success).toBe(false);
  });

  it("konfirmasi harus sama dan berbeda dari password lama", () => {
    expect(changePasswordSchema.safeParse({ current: "lama1234", next: "baru1234", confirm: "baru1234" }).success).toBe(true);
    expect(changePasswordSchema.safeParse({ current: "lama1234", next: "baru1234", confirm: "beda1234" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ current: "sama1234", next: "sama1234", confirm: "sama1234" }).success).toBe(false);
  });
});
