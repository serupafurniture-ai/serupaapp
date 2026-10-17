import { describe, expect, it } from "vitest";
import { notifications } from "@/lib/data/mock-db";
import { DEFAULT_PREFERENCES, toggleMuted } from "@/features/settings/preferences";
import { applyFilter, groupByDay, unreadCount, visibleNotifications } from "./notifications";

const none = new Set<string>();

describe("notifikasi", () => {
  it("owner melihat semua notifikasi", () => {
    expect(visibleNotifications(notifications, "owner", DEFAULT_PREFERENCES, none)).toHaveLength(notifications.length);
  });

  it("tukang tidak melihat notifikasi pembayaran atau approval", () => {
    const kinds = visibleNotifications(notifications, "produksi", DEFAULT_PREFERENCES, none).map((n) => n.kind);
    expect(kinds).not.toContain("pembayaran");
    expect(kinds).not.toContain("approval");
    expect(kinds).toContain("produksi");
  });

  it("saklar notifikasi berlaku per role", () => {
    const prefs = toggleMuted(DEFAULT_PREFERENCES, "owner", "stok");
    expect(visibleNotifications(notifications, "owner", prefs, none).some((n) => n.kind === "stok")).toBe(false);
    expect(visibleNotifications(notifications, "ppic", prefs, none).some((n) => n.kind === "stok")).toBe(true);
  });

  it("tandai dibaca & hitung belum dibaca", () => {
    const all = visibleNotifications(notifications, "owner", DEFAULT_PREFERENCES, none);
    const before = unreadCount(all);
    const after = unreadCount(visibleNotifications(notifications, "owner", DEFAULT_PREFERENCES, new Set(["n-1"])));
    expect(after).toBe(before - 1);
  });

  it("filter perlu tindakan & grup per hari WIB", () => {
    const all = visibleNotifications(notifications, "owner", DEFAULT_PREFERENCES, none);
    expect(applyFilter(all, "action").every((n) => n.actionRequired)).toBe(true);
    const groups = groupByDay(all, new Date("2026-10-18T03:00:00Z"));
    expect(groups.map((g) => g.label)).toEqual(["Hari ini", "Kemarin"]);
  });
});
