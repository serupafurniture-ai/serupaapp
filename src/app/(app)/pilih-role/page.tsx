"use client";

import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/primitives";
import { useSession } from "@/features/auth/session-context";
import { ROLE_DEFINITIONS, type Role } from "@/features/roles/roles";
import { cn } from "@/lib/cn";

const ROLE_ICON: Record<Role, IconName> = {
  owner: "home",
  marketing: "inbox",
  ppic: "calendar",
  purchasing: "cart",
  gudang: "box",
  produksi: "tool",
  qc: "shieldCheck",
  ekspedisi: "truck",
  keuangan: "wallet",
  viewer: "chart",
};

export default function PilihRolePage() {
  const { state, setActiveRole } = useSession();
  const router = useRouter();
  if (state.status !== "signed_in") return null;

  const { user, activeRole } = state;

  function choose(role: Role) {
    setActiveRole(role);
    router.push("/beranda");
  }

  return (
    <main className="pt-safe flex min-h-dvh flex-col gap-5 px-5 pb-8">
      <div className="mt-8 flex items-center gap-3.5">
        <Avatar name={user.name} />
        <div className="flex flex-col">
          <span className="text-[13px] text-ink-muted">Halo,</span>
          <span className="text-xl font-extrabold">{user.name}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">Masuk sebagai</h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Akun kamu punya {user.roles.length} role. Menu dan data yang tampil mengikuti role aktif.
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {user.roles.map((role) => {
          const def = ROLE_DEFINITIONS[role];
          const active = role === activeRole;
          return (
            <li key={role}>
              <button
                type="button"
                onClick={() => choose(role)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl p-4 text-left",
                  active ? "bg-primary text-primary-on" : "border border-line bg-surface text-ink",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 flex-none items-center justify-center rounded-xl",
                    active ? "bg-accent text-[#1F2D4D]" : "bg-surface-muted text-primary",
                  )}
                >
                  <Icon name={ROLE_ICON[role]} />
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-base font-bold">{def.label}</span>
                  <span className={cn("text-[12.5px]", active ? "opacity-80" : "text-ink-muted")}>{def.summary}</span>
                </span>
                <Icon name={active ? "check" : "chevronRight"} size={20} strokeWidth={2} />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-auto flex items-center gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
        <Icon name="shield" size={18} className="flex-none" />
        Ganti role kapan saja dari tombol nama role di pojok kanan atas.
      </p>
    </main>
  );
}
