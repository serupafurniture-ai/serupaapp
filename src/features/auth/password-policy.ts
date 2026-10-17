import { z } from "zod";

/** Blueprint §6.1: minimal 8 karakter, berisi huruf dan angka. */
export const passwordSchema = z
  .string()
  .min(8, "Minimal 8 karakter")
  .regex(/[A-Za-z]/, "Harus ada huruf")
  .regex(/\d/, "Harus ada angka");

export type PasswordCheck = { label: string; ok: boolean };

export function checkPassword(value: string): PasswordCheck[] {
  return [
    { label: "Minimal 8 karakter", ok: value.length >= 8 },
    { label: "Ada huruf", ok: /[A-Za-z]/.test(value) },
    { label: "Ada angka", ok: /\d/.test(value) },
  ];
}

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Isi password sekarang"),
    next: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Konfirmasi tidak sama" })
  .refine((v) => v.next !== v.current, { path: ["next"], message: "Password baru harus berbeda" });
