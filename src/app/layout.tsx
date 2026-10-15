import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { UIProvider } from "@/lib/ui";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { MessagingProvider } from "@/lib/messaging";
import { MarketplaceProvider } from "@/lib/marketplace";
import { CurrencyProvider } from "@/lib/currency";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Overlays from "@/components/Overlays";
import ErrorReporter from "@/components/ErrorReporter";
import ChatbotWidget from "@/components/ChatbotWidget";
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
    default: "Hirelyx — Hire Expert Freelance Talent",
    template: "%s | Hirelyx",
  },
  description:
    "Hirelyx is a global freelance marketplace where businesses hire expert freelancers for design, development, writing, marketing, video production and more. Secure payments via Stripe.",
  keywords: [
    "freelance marketplace",
    "hire freelancers",
    "freelance jobs",
    "graphic design",
    "web development",
    "content writing",
    "digital marketing",
    "video editing",
    "remote work",
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
    title: "Hirelyx — Hire Expert Freelance Talent",
    description:
      "Find and hire top freelancers for any project. Design, development, writing, marketing and more — with secure Stripe payments and global talent.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hirelyx — Hire Expert Freelance Talent",
    description:
      "Find and hire top freelancers for any project. Secure payments, global talent, 16+ languages.",
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
                  "Global freelance marketplace connecting expert freelancers with ambitious businesses.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://www.hirelyx.com/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Hirelyx",
                url: "https://www.hirelyx.com",
                logo: "https://www.hirelyx.com/logo-mark.svg",
                description:
                  "Hirelyx is a global freelance marketplace where businesses hire expert freelancers for design, development, writing, marketing, video production and more.",
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
                <MarketplaceProvider>
                  <Header />
                  {children}
                  <Footer />
                  <Overlays />
                  <ChatbotWidget />
                  <PageTracker />
                  <PresenceTracker />
                </MarketplaceProvider>
              </MessagingProvider>
            </AuthProvider>
          </UIProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
