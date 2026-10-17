"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/** Saklar on/off berbasis checkbox asli (bisa difokus & dibaca screen reader). */
export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-h-[52px] cursor-pointer items-center gap-3">
      <span className="flex flex-1 flex-col">
        <span className="text-sm">{label}</span>
        {description && <span className="text-xs text-ink-muted">{description}</span>}
      </span>
      <span className="relative h-7 w-[46px] flex-none">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
            checked ? "bg-primary" : "bg-line-strong",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-[3px] size-[22px] rounded-full bg-white shadow transition-[left]",
            checked ? "left-[21px]" : "left-[3px]",
          )}
        />
      </span>
    </label>
  );
}

/** Pilihan tunggal bergaya segmen (radio group). */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-xl bg-surface-muted p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-10 rounded-[9px] text-[13.5px] transition-colors",
              active ? "bg-surface font-bold text-ink shadow-sm" : "font-semibold text-ink-soft",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Tab berbentuk chip. */
export function ChipTabs<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-10 flex-none rounded-full px-3.5 text-[13.5px]",
              active ? "bg-ink font-bold text-bg" : "border border-line-strong bg-surface font-semibold text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
