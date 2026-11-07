import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ambilPenggunaLayout } from "@/controllers/LayoutController";
import SiteHeader from "@/views/layout/SiteHeader";
import SiteFooter from "@/views/layout/SiteFooter";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kerja-In",
  description: "Marketplace jasa harian sektor informal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await ambilPenggunaLayout();
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <a href="#main-content" className="skip-link">
            Langsung ke konten
          </a>
          <SiteHeader peran={user?.peran} nama={user?.nama} />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
