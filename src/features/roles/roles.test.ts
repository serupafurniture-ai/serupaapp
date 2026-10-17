import { describe, expect, it } from "vitest";
import { PERMISSIONS, ROLES, hasPermission, isRole } from "./roles";

describe("roles & izin", () => {
  it("owner punya semua izin", () => {
    for (const p of PERMISSIONS) expect(hasPermission("owner", p)).toBe(true);
  });

  it("hanya owner dan keuangan yang boleh membaca data keuangan", () => {
    const allowed = ROLES.filter((r) => hasPermission(r, "finance.read"));
    expect(allowed.sort()).toEqual(["keuangan", "owner"]);
  });

  it("hanya owner yang boleh memutuskan approval dan mengatur admin", () => {
    expect(ROLES.filter((r) => hasPermission(r, "approval.decide"))).toEqual(["owner"]);
    expect(ROLES.filter((r) => hasPermission(r, "settings.admin"))).toEqual(["owner"]);
  });

  it("isRole menolak nilai asing", () => {
    expect(isRole("ppic")).toBe(true);
    expect(isRole("admin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});
