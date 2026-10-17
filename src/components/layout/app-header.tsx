"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { BrandMark } from "@/components/ui/primitives";
import { useSignedInSession } from "@/features/auth/session-context";
import { useNotifications } from "@/features/notifications/notifications-context";
import { roleShortLabel } from "@/features/roles/roles";

function NotificationBell() {
  const { unread } = useNotifications();
  return (
    <Link
      href="/notifikasi"
      aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
      className="relative inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink"
    >
      <Icon name="bell" size={20} />
      {unread > 0 && (
        <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10.5px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

function RoleChip() {
  const { role, user } = useSignedInSession();
  const label = roleShortLabel(role);
  if (user.roles.length < 2) {
    return <span className="inline-flex h-9 items-center rounded-full bg-primary px-3 text-[13px] font-bold text-primary-on">{label}</span>;
  }
  return (
    <Link
      href="/pilih-role"
      aria-label={`Role aktif ${label}. Ganti role`}
      className="inline-flex h-11 items-center gap-1 rounded-full bg-primary pl-3 pr-2.5 text-[13px] font-bold text-primary-on"
    >
      {label}
      <Icon name="chevronDown" size={16} strokeWidth={2} />
    </Link>
  );
}

/** Header utama: logo, lonceng, chip role. */
export function BrandHeader() {
  return (
    <header className="pt-safe flex items-center gap-2.5 px-4 pb-2">
      <BrandMark />
      <div className="flex flex-1 flex-col leading-tight">
        <span className="text-base font-extrabold tracking-[0.05em] text-primary">SERUPA</span>
        <span className="text-[9.5px] tracking-[0.3em] text-ink-muted">FURNITURE</span>
      </div>
      <NotificationBell />
      <RoleChip />
    </header>
  );
}

/** Header halaman turunan: tombol kembali + judul. */
export function PageHeader({ title, subtitle, backHref, action }: { title: string; subtitle?: string; backHref?: string; action?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="pt-safe flex items-center gap-1 px-2 pb-1">
      {backHref !== undefined ? (
        <button
          type="button"
          aria-label="Kembali"
          onClick={() => (window.history.length > 1 ? router.back() : router.push(backHref))}
          className="inline-flex size-11 items-center justify-center rounded-full text-ink"
        >
          <Icon name="back" strokeWidth={2} />
        </button>
      ) : (
        <span className="w-2" />
      )}
      <div className="flex flex-1 flex-col">
        <h1 className="text-xl font-extrabold">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>
      {action && <div className="pr-2">{action}</div>}
    </header>
  );
}
