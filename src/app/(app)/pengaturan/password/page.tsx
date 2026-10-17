"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useSignedInSession } from "@/features/auth/session-context";
import { changePasswordSchema, checkPassword } from "@/features/auth/password-policy";
import { cn } from "@/lib/cn";

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

export default function GantiPasswordPage() {
  const { user, auth } = useSignedInSession();
  const router = useRouter();
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof values) => (e: ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    const result = await auth.changePassword(user.id, values.current, values.next);
    setSaving(false);
    if (!result.ok) return setErrors({ current: "Password sekarang salah" });
    setDone(true);
  }

  if (done) {
    return (
      <>
        <PageHeader title="Ganti password" backHref="/pengaturan" />
        <main className="flex flex-col items-center gap-4 px-6 pt-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success-ink">
            <Icon name="check" size={28} strokeWidth={2.2} />
          </span>
          <h2 className="text-lg font-extrabold">Password berhasil diganti</h2>
          <p className="text-sm text-ink-muted">Pakai password baru saat masuk berikutnya.</p>
          <Button onClick={() => router.push("/pengaturan")}>Kembali ke pengaturan</Button>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Ganti password" backHref="/pengaturan" />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 px-4 pb-10 pt-3">
        <TextField label="Password sekarang" type="password" autoComplete="current-password" value={values.current} onChange={set("current")} error={errors.current} />
        <TextField label="Password baru" type="password" autoComplete="new-password" value={values.next} onChange={set("next")} error={errors.next} />
        <ul className="flex flex-col gap-1 px-1" aria-label="Syarat password">
          {checkPassword(values.next).map((c) => (
            <li key={c.label} className={cn("flex items-center gap-2 text-[13px]", c.ok ? "text-success-ink" : "text-ink-muted")}>
              <Icon name={c.ok ? "check" : "info"} size={16} strokeWidth={2} />
              {c.label}
            </li>
          ))}
        </ul>
        <TextField label="Ulangi password baru" type="password" autoComplete="new-password" value={values.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button type="submit" disabled={saving} block>
          {saving ? "Menyimpan…" : "Simpan password"}
        </Button>
      </form>
    </>
  );
}
