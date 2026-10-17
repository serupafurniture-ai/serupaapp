"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { BrandMark, Notice } from "@/components/ui/primitives";
import { useSession } from "@/features/auth/session-context";

const SIGN_IN_ERRORS = {
  invalid_credentials: "Email/nomor HP atau password salah.",
  inactive: "Akun ini sudah dinonaktifkan. Hubungi Owner / Admin.",
  too_many_attempts: "Terlalu banyak percobaan. Coba lagi nanti atau hubungi Owner.",
} as const;

/** Hanya izinkan redirect ke path internal (cegah open redirect). */
function safeNext(raw: string | null): string | null {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

export function LoginScreen() {
  const { state, signIn, verifyTwoFactor, signOut } = useSession();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  useEffect(() => {
    if (state.status !== "signed_in") return;
    router.replace(!state.activeRole ? "/pilih-role" : (next ?? "/beranda"));
  }, [state, next, router]);

  return (
    <main className="flex min-h-dvh flex-col">
      <section className="relative overflow-hidden bg-[#1F2D4D] px-7 pb-9 pt-[max(env(safe-area-inset-top),56px)] text-white">
        <Icon name="sofa" size={340} strokeWidth={0.6} className="pointer-events-none absolute -right-24 -top-10 text-[#2C3D63]" />
        <div className="relative flex items-center gap-3">
          <BrandMark size={48} />
          <div className="flex flex-col">
            <span className="text-[22px] font-extrabold tracking-[0.06em]">SERUPA</span>
            <span className="text-[11px] tracking-[0.32em] text-[#D9C4A6]">FURNITURE</span>
          </div>
        </div>
        <p className="relative mt-7 text-[30px] font-extrabold leading-[1.15]">
          Satu KO,
          <br />
          satu sumber data.
        </p>
        <p className="relative mt-2.5 text-sm text-[#C9D0DE]">Sistem internal untuk tim Serupa &amp; Ivory Furniture.</p>
      </section>

      <div className="flex flex-1 flex-col px-6 pt-7">
        {state.status === "needs_two_factor" ? (
          <TwoFactorForm onVerify={verifyTwoFactor} onCancel={signOut} />
        ) : (
          <CredentialsForm onSignIn={signIn} />
        )}
      </div>
      <p className="pb-safe px-6 pt-6 text-center text-xs text-ink-muted">Butuh akun? Hubungi Owner / Admin.</p>
    </main>
  );
}

function CredentialsForm({ onSignIn }: { onSignIn: ReturnType<typeof useSession>["signIn"] }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Isi email/nomor HP dan password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await onSignIn(identifier, password, remember);
    setSubmitting(false);
    if (!result.ok) setError(SIGN_IN_ERRORS[result.error]);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
      <h1 className="text-xl font-bold">Masuk ke akun kamu</h1>
      <TextField
        label="Email atau nomor HP"
        name="identifier"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <TextField
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint="Minimal 8 karakter, berisi huruf dan angka."
        trailing={
          <button
            type="button"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((v) => !v)}
            className="inline-flex size-11 items-center justify-center text-ink-muted"
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} size={20} />
          </button>
        }
      />
      <div className="flex items-center justify-between">
        <label className="flex min-h-11 items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-[18px] accent-[var(--primary)]" />
          Ingat perangkat ini
        </label>
        <a href="mailto:owner@serupafurniture.id?subject=Reset%20password" className="text-sm font-semibold text-primary">
          Lupa password?
        </a>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-3 text-[13px] font-semibold text-danger-ink">
          {error}
        </p>
      )}
      <Button type="submit" disabled={submitting} block>
        {submitting ? "Memeriksa…" : "Masuk"}
      </Button>
      <Notice icon="lock">Akun pribadi per orang, tidak boleh dipakai bersama. Owner wajib verifikasi 2 langkah.</Notice>
    </form>
  );
}

function TwoFactorForm({
  onVerify,
  onCancel,
}: {
  onVerify: ReturnType<typeof useSession>["verifyTwoFactor"];
  onCancel: () => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await onVerify(code);
    setSubmitting(false);
    if (!result.ok) setError("Kode salah atau kedaluwarsa. Coba lagi.");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">Verifikasi 2 langkah</h1>
        <p className="text-sm text-ink-muted">Masukkan 6 digit kode dari aplikasi authenticator kamu.</p>
      </div>
      <TextField
        label="Kode verifikasi"
        name="otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="\d{6}"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        error={error ?? undefined}
        className="text-center font-mono text-2xl tracking-[0.5em]"
        autoFocus
      />
      <Button type="submit" disabled={code.length !== 6 || submitting} block>
        {submitting ? "Memverifikasi…" : "Verifikasi"}
      </Button>
      <Button variant="ghost" onClick={() => void onCancel()} block>
        Batal, pakai akun lain
      </Button>
    </form>
  );
}
