import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { THEME_STORAGE_KEY } from "@/features/settings/preferences";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Serupa", template: "%s · Serupa" },
  description: "Sistem internal Serupa Furniture",
  applicationName: "Serupa",
  appleWebApp: { capable: true, title: "Serupa", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/apple-touch-icon.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#16171b" },
  ],
};

/** Pasang tema sebelum halaman tampil supaya tidak berkedip terang→gelap. */
const themeScript = `(function(){try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||'"system"');var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- dimuat sekali di root layout */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <Providers>
          <div className="mx-auto min-h-dvh max-w-app">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
