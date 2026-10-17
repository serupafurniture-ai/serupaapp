import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-colors select-none " +
  "disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-soft disabled:border-transparent";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-on hover:opacity-95 active:opacity-90",
  secondary: "bg-surface text-ink border border-line-strong hover:bg-surface-muted",
  danger: "bg-surface text-danger-ink border-[1.5px] border-danger hover:bg-danger-soft",
  ghost: "bg-transparent text-primary hover:bg-primary-soft",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-[52px] px-5 text-[15px]",
};

type CommonProps = { variant?: Variant; size?: Size; block?: boolean; children: ReactNode };

export function Button({
  variant = "primary",
  size = "lg",
  block,
  className,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn(base, variants[variant], sizes[size], block && "w-full", className)} {...rest} />;
}

export function ButtonLink({
  variant = "primary",
  size = "lg",
  block,
  className,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return <Link className={cn(base, variants[variant], sizes[size], block && "w-full", className)} {...rest} />;
}

export function IconButton({
  label,
  className,
  children,
  type = "button",
  ...rest
}: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
