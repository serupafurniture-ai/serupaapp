"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { ChipTabs } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/primitives";
import { useNotifications } from "@/features/notifications/notifications-context";
import { applyFilter, groupByDay, type NotificationFilter } from "@/features/notifications/notifications";
import { cn } from "@/lib/cn";
import type { AppNotification, NotificationKind } from "@/lib/data/types";
import { formatTimeWib } from "@/lib/format";

const KIND_STYLE: Record<NotificationKind, { icon: IconName; className: string }> = {
  approval: { icon: "cart", className: "bg-accent-soft text-accent-ink" },
  pengiriman: { icon: "truck", className: "bg-danger-soft text-danger-ink" },
  stok: { icon: "box", className: "bg-warning-soft text-warning-ink" },
  produksi: { icon: "tool", className: "bg-primary-soft text-primary" },
  qc: { icon: "shieldCheck", className: "bg-success-soft text-success-ink" },
  pembayaran: { icon: "wallet", className: "bg-info-soft text-info-ink" },
  order: { icon: "clipboard", className: "bg-surface-muted text-ink-soft" },
  pesan: { icon: "inbox", className: "bg-surface-muted text-ink-soft" },
};

export default function NotifikasiPage() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const actionCount = items.filter((n) => n.actionRequired).length;
  const groups = useMemo(() => groupByDay(applyFilter(items, filter)), [items, filter]);

  return (
    <>
      <PageHeader
        title="Notifikasi"
        backHref="/beranda"
        action={
          unread > 0 ? (
            <Button variant="ghost" size="md" onClick={markAllRead}>
              Tandai dibaca
            </Button>
          ) : undefined
        }
      />
      <main className="flex flex-col gap-1 px-4 pb-32">
        <ChipTabs
          label="Saring notifikasi"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `Semua · ${items.length}` },
            { value: "action", label: `Perlu tindakan · ${actionCount}` },
          ]}
        />

        {groups.length === 0 ? (
          <div className="pt-6">
            <EmptyState title="Belum ada notifikasi">Notifikasi untuk role kamu akan muncul di sini.</EmptyState>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.label} aria-label={group.label} className="flex flex-col gap-2 pt-4">
              <h2 className="px-1 text-xs font-bold tracking-[0.08em] text-ink-muted">{group.label.toUpperCase()}</h2>
              <ul className="flex flex-col gap-2">
                {group.items.map((n) => (
                  <li key={n.id}>
                    <NotificationRow item={n} onOpen={() => markRead([n.id])} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
      <BottomNav />
    </>
  );
}

function NotificationRow({ item, onOpen }: { item: AppNotification; onOpen: () => void }) {
  const style = KIND_STYLE[item.kind];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn("flex w-full gap-3 rounded-2xl border bg-surface p-3.5 text-left", item.read ? "border-line" : "border-line-strong")}
    >
      <span className={cn("flex size-10 flex-none items-center justify-center rounded-xl", style.className)}>
        <Icon name={style.icon} size={20} />
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={cn("text-sm", item.read ? "font-semibold" : "font-bold")}>{item.title}</span>
        <span className="text-[13px] text-ink-soft">{item.body}</span>
        <span className="flex items-center gap-2 text-xs text-ink-muted">
          {formatTimeWib(new Date(item.createdAt))}
          {item.actionRequired && <span className="font-bold text-warning-ink">· Perlu tindakan</span>}
        </span>
      </span>
      {!item.read && (
        <span className="mt-1.5 size-[9px] flex-none rounded-full bg-danger">
          <span className="sr-only">Belum dibaca</span>
        </span>
      )}
    </button>
  );
}
