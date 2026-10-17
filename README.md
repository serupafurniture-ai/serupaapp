# Serupa App

Sistem internal Serupa Furniture. Aplikasi ini adalah web app yang bisa dipasang di HP (PWA), dibuat mobile-first, dan disiapkan untuk Supabase sesuai Blueprint v2.0 §13 opsi B.

**Tahap ini:** bagian **Umum (semua role)**, yaitu Login + 2FA Owner, Pilih Role, Beranda, Tanya Serupa, Notifikasi, Pengaturan & Akun, dan Ganti Password. Aplikasi masih jalan dengan **data contoh**, bukan data nyata.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
cp .env.example .env.local   # opsional, default sudah pakai data contoh
npm run dev                  # http://localhost:3000
```

Untuk mencoba versi produksi (termasuk mode offline PWA): `npm run build && npm start`.

### Akun demo

Semua akun memakai password **`serupa123`**.

| Akun | Role | Catatan |
|---|---|---|
| dina@serupafurniture.id | Owner, PPIC, Keuangan | Wajib 2FA, kode demo **`123456`** |
| andi@serupafurniture.id | PPIC | Bisa login pakai HP `0813-7712-0034` |
| rizky@serupafurniture.id | Marketing | |
| darto@serupafurniture.id | Produksi / Tukang | |
| bayu@serupafurniture.id | Gudang | Akun nonaktif, untuk tes penolakan |

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run check` | Typecheck + lint + unit test |
| `npm test` | Unit test (Vitest) |

## Struktur

```
src/
  app/                    Halaman (Next.js App Router)
    (auth)/login/         Login + verifikasi 2 langkah
    (app)/                Halaman setelah login, dijaga SessionGate
      pilih-role/ beranda/ tanya/ notifikasi/ pengaturan/
    layout.tsx            Font, tema anti-kedip, provider
    manifest.ts           Manifest PWA
  components/
    ui/                   Komponen dasar: Button, TextField, Switch, Badge, Icon, …
    layout/               Header, BottomNav, SessionGate
  features/               Logika per domain (tanpa UI sebisa mungkin)
    roles/                Daftar role, izin, hasPermission()
    auth/                 AuthService (kontrak), mock, session context, aturan password
    assistant/            Tanya Serupa: tool berizin + sumber + "Belum ada data"
    notifications/        Filter per role, saklar, grup per hari WIB
    settings/             Preferensi tema & notifikasi
  lib/
    data/                 Tipe domain, data contoh, repository (titik ganti ke Supabase)
    supabase/             Klien Supabase (dipakai mulai Fase 1)
    format.ts             Rupiah bulat & waktu WIB
supabase/migrations/      Draf skema + Row Level Security Fase 1
public/sw.js              Service worker: cache cangkang aplikasi
```

## Prinsip yang sudah diterapkan

- **Izin dicek per role aktif.** Satu pengguna bisa punya banyak role, dan yang berlaku role yang sedang aktif. Di klien, izin hanya mengatur tampilan. Perlindungan sebenarnya nanti dari Row Level Security; draf policy-nya ada di `supabase/migrations`.
- **Tanya Serupa tidak mengarang.** Jawaban hanya diambil dari "tool" yang punya izin dan selalu menyebut sumbernya. Kalau datanya kosong, jawabannya "Belum ada data". Role tanpa izin keuangan mendapat penolakan sopan. Perintah yang diselipkan di dalam pertanyaan tidak mengubah izin (Tes wajib 17, 18, 19).
- **Uang & waktu.** Nominal rupiah selalu bilangan bulat, dan semua waktu ditampilkan dalam WIB.
- **Keamanan login.** Pesan error tidak memberi tahu apakah sebuah akun ada. Login dikunci setelah 5 kali gagal, dan redirect hanya boleh ke halaman internal.
- **Aksesibilitas.** Target sentuh minimal 44 px, label di setiap input, dan saklar/tab memakai role ARIA yang benar. Tema terang, gelap, dan ikut sistem tersedia tanpa layar berkedip.

## Beralih ke Supabase (Fase 1)

1. Buat project Supabase, lalu jalankan `supabase/migrations/0001_fondasi_pengguna_role.sql` **setelah direview**.
2. Isi `.env.local` dengan `NEXT_PUBLIC_DATA_SOURCE=supabase`, URL project, dan anon key.
3. Implementasikan `AuthService` (src/features/auth/auth-service.ts) memakai `supabase.auth` + MFA TOTP, dan `DataRepository` (src/lib/data/repositories.ts) memakai query Supabase.
4. Ganti `getRepository()` dan `createMockAuthService()` ke implementasi Supabase. UI tidak perlu diubah.
5. Tanya Serupa pindah ke route server yang memanggil API model bahasa. Kunci API hanya disimpan di server. Tool & aturan izin di `assistant.ts` tetap dipakai.

## Batasan tahap ini

- Data, password, dan kode 2FA masih versi demo. **Jangan dipakai di produksi.**
- Sesi, preferensi, dan status baca notifikasi disimpan di browser (localStorage).
- Dashboard tiap role (Owner, PPIC, Gudang, dst.) dan menu Admin dibangun di tahap berikutnya.
- Font dimuat dari Google Fonts. Kalau offline, aplikasi memakai font sistem.
