import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { UIProvider } from "@/lib/ui";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { MessagingProvider } from "@/lib/messaging";
import { CurrencyProvider } from "@/lib/currency";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Overlays from "@/components/Overlays";
import ErrorReporter from "@/components/ErrorReporter";
import ChatWidget from "@/components/ChatWidget";
import PageTracker from "@/components/PageTracker";
import PresenceTracker from "@/components/PresenceTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hirelyx.com"),
  title: {
    default: "Hirelyx — Professional Digital Services",
    template: "%s | Hirelyx",
  },
  description:
    "Hirelyx is a professional digital services team offering web development, app development, UI/UX design, graphic design, digital marketing and more.",
  keywords: [
    "digital services",
    "web development",
    "app development",
    "UI/UX design",
    "graphic design",
    "digital marketing",
    "professional services",
    "Hirelyx",
  ],
  authors: [{ name: "Hirelyx" }],
  creator: "Hirelyx",
  publisher: "Hirelyx",
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: "Hirelyx", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: "Hirelyx",
    title: "Hirelyx — Professional Digital Services",
    description:
      "Professional digital services team — web development, app development, design, marketing and more.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hirelyx — Professional Digital Services",
    description:
      "Professional digital services — web development, design, marketing and more.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0066cc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Hirelyx",
                url: "https://www.hirelyx.com",
                description:
                  "Professional digital services team offering web development, design, marketing and more.",
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Hirelyx",
                url: "https://www.hirelyx.com",
                logo: "https://www.hirelyx.com/logo-mark.svg",
                description:
                  "Professional digital services team offering web development, app development, design, marketing and more.",
                sameAs: [],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  url: "https://www.hirelyx.com/contact",
                  availableLanguage: ["English", "Spanish", "French", "German", "Arabic", "Urdu", "Hindi"],
                },
              },
            ]),
          }}
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
        <ErrorReporter />
        <I18nProvider>
          <CurrencyProvider>
          <UIProvider>
            <AuthProvider>
              <MessagingProvider>
                  <Header />
                  {children}
                  <Footer />
                  <Overlays />
                  <ChatWidget />
                  <PageTracker />
                  <PresenceTracker />
              </MessagingProvider>
            </AuthProvider>
          </UIProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
