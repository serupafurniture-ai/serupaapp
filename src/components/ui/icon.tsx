import type { SVGProps } from "react";

/** Ikon garis 24×24, warna mengikuti currentColor. Tambah ikon baru di sini saja. */
const PATHS = {
  sofa: "M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3 M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4H3z M5 17v2 M19 17v2",
  home: "M3 11l9-7 9 7 M5 10v10h14V10",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 20a2 2 0 0 0 4 0",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0",
  settings: "M4 7h10 M18 7h2 M4 17h4 M12 17h8 M16 5v4 M10 15v4",
  back: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  check: "M5 12l5 5 9-10",
  close: "M6 6l12 12 M18 6L6 18",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff: "M3 3l18 18 M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9 M6.1 6.1C3.6 7.8 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.3-1",
  lock: "M5 11h14v10H5z M8 11V8a4 4 0 0 1 8 0v3",
  shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
  shieldCheck: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z M8.5 12l2.5 2.5 4.5-5",
  send: "M4 12l16-8-6 16-3-7z",
  mic: "M9 6a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z M5 11a7 7 0 0 0 14 0 M12 18v3",
  cart: "M3 4h3l2 11h11l2-8H7 M10 19.5h.01 M17 19.5h.01",
  truck: "M2 6h12v10H2z M14 10h4l3 3v3h-7 M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  box: "M3 7l9-4 9 4-9 4z M3 7v10l9 4 9-4V7 M12 11v10",
  wallet: "M3 6h18v14H3z M16 13h2 M3 10h18",
  tool: "M14.5 5.5a4 4 0 0 0 4.9 4.9L11 19a2.1 2.1 0 0 1-3-3z",
  clipboard: "M5 4h14v17H5z M9 4h6v3H9z M9 12h6 M9 16h4",
  inbox: "M3 13l3-8h12l3 8v6H3z M3 13h5l1 2h6l1-2h5",
  calendar: "M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4",
  chart: "M5 20V11 M11 20V5 M17 20v-7 M3 20h18",
  logout: "M15 4h4v16h-4 M10 8l-4 4 4 4 M6 12h10",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8v.5",
  alert: "M12 3l10 18H2z M12 10v5 M12 18v.5",
  refresh: "M4 12a8 8 0 0 1 14-5.3 M20 12a8 8 0 0 1-14 5.3 M18 3v4h-4 M6 21v-4h4",
} as const;

export type IconName = keyof typeof PATHS;

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Isi bila ikon berdiri sendiri tanpa teks (mis. di tombol ikon pakai aria-label pada tombolnya). */
  title?: string;
};

export function Icon({ name, size = 22, strokeWidth = 1.8, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
