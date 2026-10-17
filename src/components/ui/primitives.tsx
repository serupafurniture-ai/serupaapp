import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { initialsOf } from "@/lib/format";
import { Icon } from "./icon";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-surface", className)} {...rest} />;
}

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-soft",
  primary: "bg-primary text-primary-on",
  success: "bg-success-soft text-success-ink",
  warning: "bg-warning-soft text-warning-ink",
  danger: "bg-danger-soft text-danger-ink",
  info: "bg-info-soft text-info-ink",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-bold", toneClass[tone], className)}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = 52, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      className={cn("inline-flex flex-none items-center justify-center rounded-full bg-primary font-bold text-primary-on", className)}
    >
      {initialsOf(name)}
    </span>
  );
}

export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size, borderRadius: size * 0.29 }}
      className="inline-flex flex-none items-center justify-center bg-accent text-[#1F2D4D]"
      aria-hidden="true"
    >
      <Icon name="sofa" size={size * 0.58} />
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-extrabold">{children}</h2>
      {action}
    </div>
  );
}

export function Notice({ tone = "neutral", icon = "info", children }: { tone?: Tone; icon?: "info" | "lock" | "shield" | "alert"; children: ReactNode }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed", toneClass[tone])}>
      <Icon name={icon} size={18} className="mt-px flex-none" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="font-bold">{title}</p>
      {children && <p className="text-sm text-ink-muted text-pretty">{children}</p>}
    </div>
  );
}
