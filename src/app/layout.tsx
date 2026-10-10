import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { UIProvider } from "@/lib/ui";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { MessagingProvider } from "@/lib/messaging";
import { MarketplaceProvider } from "@/lib/marketplace";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Overlays from "@/components/Overlays";
import ErrorReporter from "@/components/ErrorReporter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hirelyx — Hire Expert Freelance Talent",
  description:
    "Hirelyx — the high-end global marketplace connecting expert freelancers with ambitious businesses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
        <ErrorReporter />
        <I18nProvider>
          <UIProvider>
            <AuthProvider>
              <MessagingProvider>
                <MarketplaceProvider>
                  <Header />
                  {children}
                  <Footer />
                  <Overlays />
                </MarketplaceProvider>
              </MessagingProvider>
            </AuthProvider>
          </UIProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
