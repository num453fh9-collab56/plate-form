import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./hirelyx.css";
import { UIProvider } from "@/lib/ui";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { MessagingProvider } from "@/lib/messaging";
import { CurrencyProvider } from "@/lib/currency";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { RevealOnScroll } from "@/components/site/interactive";
import Overlays from "@/components/Overlays";
import ErrorReporter from "@/components/ErrorReporter";
import ChatWidget from "@/components/ChatWidget";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import PageTracker from "@/components/PageTracker";
import PresenceTracker from "@/components/PresenceTracker";
import { SITE_URL, organizationSchema, websiteSchema } from "@/lib/seo";

/* Body text. Self-hosted by next/font, so no third-party font request. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Display face for headings — variable axis, two subsets kept small. */
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hirelyx — Python, AI & Digital Engineering Partner",
    template: "%s | Hirelyx",
  },
  description:
    "Hirelyx builds intelligent digital solutions: Python and FastAPI backends, custom AI agents, MCP servers, WordPress builds and measured digital marketing.",
  keywords: [
    "python development services",
    "fastapi development",
    "custom ai agents",
    "mcp server development",
    "prompt engineering",
    "wordpress development",
    "digital marketing agency",
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
    title: "Hirelyx — Python, AI & Digital Engineering Partner",
    description:
      "Python and FastAPI engineering, custom AI agents, MCP servers, WordPress builds and measured digital marketing.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hirelyx — Python, AI & Digital Engineering Partner",
    description:
      "Python and FastAPI engineering, custom AI agents, MCP servers and measured digital marketing.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b5fd0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteSchema(), organizationSchema()]),
          }}
        />
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
        <ErrorReporter />
        <I18nProvider>
          <CurrencyProvider>
            <UIProvider>
              <AuthProvider>
                <MessagingProvider>
                  <SiteHeader />
                  <main id="main">{children}</main>
                  <SiteFooter />
                  <Overlays />
                  <ChatWidget />
                  <ScrollToTop />
                  <CookieConsent />
                  <PageTracker />
                  <PresenceTracker />
                  <RevealOnScroll />
                </MessagingProvider>
              </AuthProvider>
            </UIProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
