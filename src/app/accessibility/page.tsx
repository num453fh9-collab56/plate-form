import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { DocPage, PageHero } from "@/components/site/ui";
import { SUPPORT_EMAIL, breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Accessibility Statement",
  description:
    "How Hirelyx approaches digital accessibility: semantic HTML, keyboard support, contrast, reduced-motion support, and how to report a barrier.",
  path: "/accessibility",
});

const UPDATED = "October 2026";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Accessibility" }];

const TOC = [
  { id: "commitment", label: "Our commitment" },
  { id: "practice", label: "What we do" },
  { id: "limitations", label: "Known limitations" },
  { id: "feedback", label: "Feedback" },
];

export default function AccessibilityPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(CRUMBS)} />

      <PageHero
        crumbs={CRUMBS}
        kicker="Commitment"
        title="Accessibility Statement"
        lead={`Last updated ${UPDATED}. What we build in by default, what is still imperfect, and how to tell us when something blocks you.`}
      />

      <DocPage toc={TOC}>
        <h2 id="commitment">Our commitment</h2>
        <p>
          Hirelyx is committed to digital accessibility for people of all abilities. We treat
          accessibility as part of building something correctly rather than as a later audit, and we
          target WCAG 2.1 AA as a working baseline.
        </p>

        <h2 id="practice">What we do</h2>
        <ul>
          <li>
            <strong>Semantic HTML:</strong> a single main landmark per page, a logical heading
            order, real lists and real buttons, with ARIA used only where native semantics do not
            already say it.
          </li>
          <li>
            <strong>Keyboard navigation:</strong> every interactive element is reachable and
            operable from the keyboard. The mega menu and mobile drawer close on Escape, disclosure
            controls expose their state, and focus indicators are visible everywhere.
          </li>
          <li>
            <strong>Skip link:</strong> a skip-to-content link is the first focusable element on
            every page.
          </li>
          <li>
            <strong>Colour contrast:</strong> text and interactive elements are checked against WCAG
            2.1 AA contrast ratios, and state is never signalled by colour alone.
          </li>
          <li>
            <strong>Reduced motion:</strong> animated reveals, the technology marquee and the hero
            composition are all suppressed when the operating system requests reduced motion.
          </li>
          <li>
            <strong>Responsive design:</strong> layouts work from roughly 320&nbsp;px upwards and
            support text scaling to 200% without loss of content.
          </li>
          <li>
            <strong>Alt text:</strong> meaningful images carry descriptive alternatives, and
            decorative artwork is hidden from assistive technology. Where a cover image is an
            illustration rather than a screenshot, the alt text says so.
          </li>
          <li>
            <strong>Forms:</strong> every input has an associated label; errors are tied to their
            field with <code>aria-describedby</code> and announced through a live region, not only
            shown in red.
          </li>
        </ul>

        <h2 id="limitations">Known limitations</h2>
        <p>
          Some parts of the product are still improving. The signed-in dashboard and client portal
          carry older markup than the public pages, and some third-party embeds — payment, sign-in
          and video — are outside our direct control. We fix what we find, and we would rather name
          these gaps than claim the site is flawless.
        </p>

        <h2 id="feedback">Feedback</h2>
        <p>
          If something on this site blocks you, please tell us. A specific report — the page, what
          you were trying to do, and the assistive technology or browser you were using — gets fixed
          fastest.
        </p>
        <ul>
          <li>
            Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </li>
          <li>Or use the chat widget on any page, which can hand over to a person.</li>
        </ul>
      </DocPage>
    </>
  );
}
