"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { useNotifications } from "@/features/notifications/notifications-context";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; icon: IconName };

/**
 * Menu bawah fase Umum. Saat modul tiap role dibangun, daftar ini
 * diturunkan dari role aktif (mis. PPIC: Dashboard · Order · Produksi · Bahan · Lainnya).
 */
const ITEMS: readonly NavItem[] = [
  { href: "/beranda", label: "Beranda", icon: "home" },
  { href: "/tanya", label: "Tanya", icon: "sparkle" },
  { href: "/notifikasi", label: "Notifikasi", icon: "bell" },
  { href: "/pengaturan", label: "Akun", icon: "user" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { unread } = useNotifications();

  return (
    <nav
      aria-label="Menu utama"
      className="pb-safe fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app border-t border-line bg-surface/95 backdrop-blur"
    >
      <ul className="grid grid-cols-4 px-2 pt-1.5">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-[11px]",
                  active ? "font-bold text-primary" : "font-semibold text-ink-muted",
                )}
              >
                <span className={cn("relative flex h-[30px] w-[52px] items-center justify-center rounded-full", active && "bg-primary-soft")}>
                  <Icon name={item.icon} strokeWidth={active ? 1.9 : 1.8} />
                  {item.href === "/notifikasi" && unread > 0 && (
                    <span className="absolute right-2.5 top-0.5 size-2 rounded-full bg-danger" aria-hidden="true" />
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
