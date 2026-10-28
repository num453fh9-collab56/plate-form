import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import FaqSearch from "@/components/site/FaqSearch";
import { Btn, ClosingCta, PageHero, Section } from "@/components/site/ui";
import { SITE_FAQS } from "@/lib/content/faq";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "FAQ" }];

export const metadata: Metadata = pageMetadata({
  title: "FAQ — Services, Projects, Payments & Technology",
  description:
    "Answers to common questions about Hirelyx services, how projects run, pricing and payment, the technologies we use, and booking a consultation.",
  path: "/faq",
  keywords: ["hirelyx faq", "agency pricing questions", "software project process"],
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(CRUMBS), faqSchema(SITE_FAQS)]} />

      <PageHero
        crumbs={CRUMBS}
        kicker="FAQ"
        title="Frequently asked questions"
        lead="Services, projects, payments, technology and bookings. If your question is not here, ask it — we would rather answer than have you guess."
        actions={
          <>
            <Btn href="/contact" arrow>
              Ask a question
            </Btn>
            <Btn href="/how-it-works" variant="secondary">
              How we work
            </Btn>
          </>
        }
      />

      <Section tone="alt">
        <FaqSearch />
      </Section>

      <ClosingCta
        title="Still deciding?"
        body="A short consultation usually settles more than a long email thread. The first one is free and comes with no obligation."
        primary={{ label: "Book a consultation", href: "/bookings" }}
        secondary={{ label: "Send a project request", href: "/contact" }}
      />
    </>
  );
}
