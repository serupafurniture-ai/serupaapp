import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Elemen di sisi kanan input, mis. tombol tampilkan password. */
  trailing?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, hint, error, trailing, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-[52px] w-full rounded-xl border bg-surface px-4 text-[15px] text-ink placeholder:text-ink-muted",
            error ? "border-danger" : "border-line-strong",
            trailing && "pr-14",
            className,
          )}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs font-semibold text-danger-ink">
          {error}
        </p>
      ) : hint ? (
        <div id={`${inputId}-hint`} className="text-xs text-ink-muted">
          {hint}
        </div>
      ) : null}
    </div>
  );
});
