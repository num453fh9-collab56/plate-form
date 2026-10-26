import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import InsightsList from "@/components/site/InsightsList";
import { Btn, ClosingCta, PageHero, Section } from "@/components/site/ui";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

/* ==========================================================================
   HIRELYX · INSIGHTS (/blog)
   The route stays /blog so existing indexed article URLs keep working;
   "Insights" is the navigation label. /insights redirects here.
   ========================================================================== */

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Insights" }];

export const metadata: Metadata = pageMetadata({
  title: "Insights — Engineering Notes & Technical Write-Ups",
  description:
    "Notes from the Hirelyx team on Python and FastAPI engineering, AI agents, MCP servers, prompt evaluation and measured digital marketing.",
  path: "/blog",
  keywords: ["python engineering blog", "ai agent engineering", "mcp server guide", "technical seo notes"],
});

export default function InsightsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <PageHero
        crumbs={CRUMBS}
        kicker="Insights"
        title="Notes from the work, not from a content calendar."
        lead="Engineering write-ups, technical decisions and the occasional post-mortem. Published when we have something worth saying rather than on a schedule."
        actions={
          <>
            <Btn href="/portfolio" arrow>
              Browse case studies
            </Btn>
            <Btn href="/expertise" variant="secondary">
              See our expertise
            </Btn>
          </>
        }
      />

      <Section tone="alt">
        <InsightsList />
      </Section>

      <ClosingCta
        title="Prefer a conversation to an article?"
        body="If you are weighing a technical decision, a short call is usually more useful than anything we could write. No obligation attached."
        primary={{ label: "Book a consultation", href: "/bookings" }}
        secondary={{ label: "Send us a question", href: "/contact" }}
      />
    </>
  );
}
