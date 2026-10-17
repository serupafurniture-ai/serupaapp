"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { SegmentedControl, Switch } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icon";
import { Avatar, Badge, Card, SectionTitle } from "@/components/ui/primitives";
import { useSignedInSession } from "@/features/auth/session-context";
import { hasPermission, roleShortLabel } from "@/features/roles/roles";
import { usePreferences } from "@/features/settings/preferences-context";
import { isMuted, NOTIFICATION_KINDS, toggleMuted, type ThemePreference } from "@/features/settings/preferences";

const THEME_OPTIONS: readonly { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
  { value: "system", label: "Sistem" },
];

const ADMIN_LINKS = ["Pengguna & role", "Kategori & satuan", "Checklist QC", "Template SPK", "Tarif & target", "Backup & ekspor"];

export default function PengaturanPage() {
  const { user, role, signOut } = useSignedInSession();
  const { prefs, update } = usePreferences();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <>
      <PageHeader title="Pengaturan" />
      <main className="flex flex-col gap-2.5 px-4 pb-32 pt-1">
        <Card className="flex items-center gap-3.5 p-4">
          <Avatar name={user.name} size={56} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-base font-extrabold">{user.name}</span>
            <span className="truncate text-[12.5px] text-ink-soft">{user.email}</span>
            <div className="flex flex-wrap gap-1">
              {user.roles.map((r) => (
                <Badge key={r} tone={r === role ? "primary" : "neutral"}>
                  {roleShortLabel(r)}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col px-4">
          <Link href="/pengaturan/password" className="flex min-h-[52px] items-center gap-3 border-b border-line text-[14.5px]">
            <span className="flex-1">Ganti password</span>
            <Icon name="chevronRight" size={18} className="text-ink-muted" />
          </Link>
          <div className="flex min-h-[52px] items-center gap-3 text-[14.5px]">
            <span className="flex-1">Verifikasi 2 langkah</span>
            {user.requiresTwoFactor ? <Badge tone="success">Aktif · wajib Owner</Badge> : <Badge>Tidak wajib</Badge>}
          </div>
        </Card>

        <Card className="flex flex-col gap-2.5 p-4">
          <SectionTitle>Tema</SectionTitle>
          <SegmentedControl label="Tema" value={prefs.theme} options={THEME_OPTIONS} onChange={(theme) => update({ ...prefs, theme })} />
        </Card>

        <Card className="flex flex-col px-4 pt-3.5">
          <SectionTitle>Notifikasi · role {roleShortLabel(role)}</SectionTitle>
          <div className="flex flex-col divide-y divide-line">
            {NOTIFICATION_KINDS.map(({ kind, label }) => (
              <Switch
                key={kind}
                label={label}
                checked={!isMuted(prefs, role, kind)}
                onChange={() => update(toggleMuted(prefs, role, kind))}
              />
            ))}
          </div>
        </Card>

        {hasPermission(role, "settings.admin") && (
          <Card className="flex flex-col gap-2.5 p-4">
            <SectionTitle>Admin (khusus Owner)</SectionTitle>
            <ul className="grid grid-cols-2 gap-2">
              {ADMIN_LINKS.map((label) => (
                <li key={label}>
                  <span
                    aria-disabled="true"
                    className="flex min-h-12 items-center rounded-xl bg-bg px-3 text-[13.5px] font-semibold text-ink-soft"
                    title="Tersedia di fase Admin"
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-muted">Menu admin aktif di fase berikutnya.</p>
          </Card>
        )}

        <Button variant="danger" onClick={handleSignOut} className="mt-2" block>
          <Icon name="logout" size={18} />
          Keluar
        </Button>
      </main>
      <BottomNav />
    </>
  );
}
