"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, Notice } from "@/components/ui/primitives";
import { useSignedInSession } from "@/features/auth/session-context";
import { useNotifications } from "@/features/notifications/notifications-context";
import { ROLE_DEFINITIONS } from "@/features/roles/roles";
import { formatDateTimeWib, greeting } from "@/lib/format";

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Shortcut({ href, icon, title, detail }: { href: string; icon: IconName; title: string; detail: string }) {
  return (
    <Link href={href} className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4">
      <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon name={icon} />
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-bold">{title}</span>
        <span className="text-[12.5px] text-ink-muted">{detail}</span>
      </span>
      <Icon name="chevronRight" size={20} className="text-ink-muted" />
    </Link>
  );
}

/**
 * Beranda fase Umum. Dashboard khusus tiap role (Owner, PPIC, Gudang, dst.)
 * menggantikan isi halaman ini di fase berikutnya.
 */
export default function BerandaPage() {
  const { user, role } = useSignedInSession();
  const { unread } = useNotifications();
  const now = useNow();

  return (
    <>
      <BrandHeader />
      <main className="flex flex-col gap-4 px-4 pb-32">
        <div className="flex flex-col gap-0.5 pt-2">
          <span className="min-h-5 text-[13px] text-ink-muted">{now ? formatDateTimeWib(now) : ""}</span>
          <h1 className="text-2xl font-extrabold">
            {now ? greeting(now) : "Halo"}, {user.name.split(" ")[0]}
          </h1>
        </div>

        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-bold tracking-wider text-ink-muted">ROLE AKTIF</span>
          <span className="text-lg font-extrabold">{ROLE_DEFINITIONS[role].label}</span>
          <span className="text-[13px] text-ink-soft">{ROLE_DEFINITIONS[role].summary}</span>
        </Card>

        <div className="flex flex-col gap-2.5">
          <Shortcut href="/tanya" icon="sparkle" title="Tanya Serupa" detail="Tanya status KO, stok, SPK, pengiriman" />
          <Shortcut
            href="/notifikasi"
            icon="bell"
            title="Notifikasi"
            detail={unread ? `${unread} belum dibaca` : "Semua sudah dibaca"}
          />
          <Shortcut href="/pengaturan" icon="settings" title="Pengaturan & akun" detail="Tema, notifikasi, password" />
        </div>

        <Notice tone="info">Dashboard {ROLE_DEFINITIONS[role].label} dibangun di tahap berikutnya.</Notice>
      </main>
      <BottomNav />
    </>
  );
}
