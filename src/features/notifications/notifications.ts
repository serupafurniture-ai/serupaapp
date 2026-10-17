import { hasPermission, type Role } from "@/features/roles/roles";
import { isMuted, type Preferences } from "@/features/settings/preferences";
import type { AppNotification } from "@/lib/data/types";
import { relativeDayLabel } from "@/lib/format";

export type NotificationFilter = "all" | "action";

/** Hanya notifikasi yang boleh dilihat role aktif dan tidak dimatikan pengguna. */
export function visibleNotifications(
  items: readonly AppNotification[],
  role: Role,
  prefs: Preferences,
  readIds: ReadonlySet<string>,
): AppNotification[] {
  return items
    .filter((n) => hasPermission(role, n.requires) && !isMuted(prefs, role, n.kind))
    .map((n) => ({ ...n, read: n.read || readIds.has(n.id) }));
}

export function applyFilter(items: readonly AppNotification[], filter: NotificationFilter): AppNotification[] {
  return filter === "action" ? items.filter((n) => n.actionRequired) : [...items];
}

export function groupByDay(items: readonly AppNotification[], now: Date = new Date()) {
  const groups: { label: string; items: AppNotification[] }[] = [];
  for (const item of items) {
    const label = relativeDayLabel(new Date(item.createdAt), now);
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export const unreadCount = (items: readonly AppNotification[]) => items.filter((n) => !n.read).length;
