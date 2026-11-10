import type { Metadata } from "next";
import { OfferStoreProvider } from "@/components/offer-store";
import { SavedJobsProvider } from "@/components/saved-jobs-provider";
import { SiteFooter, SiteHeader } from "@/components/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kerja-In — Kerja jelas. Orang tepat.",
    template: "%s | Kerja-In",
  },
  description: "Temukan pekerjaan harian sesuai keahlian dan lokasimu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="id">
      <body>
        <SavedJobsProvider>
          <OfferStoreProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </OfferStoreProvider>
        </SavedJobsProvider>
      </body>
    </html>
  );
}
