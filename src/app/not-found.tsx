import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-extrabold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-ink-muted">Alamat ini tidak ada atau belum tersedia untuk role kamu.</p>
      <ButtonLink href="/">Kembali ke beranda</ButtonLink>
    </main>
  );
}
