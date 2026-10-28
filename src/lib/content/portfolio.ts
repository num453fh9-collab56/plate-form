import type { CaseStudy } from "./types";

/* ==========================================================================
   HIRELYX · CASE STUDIES
   --------------------------------------------------------------------------
   HONESTY RULES — do not relax these:
     · Entries 1–6 carry over project descriptions and outcome figures that
       were already published on hirelyx.com. They are the business's own
       stated results; verify them before any new publication.
     · Entries marked `placeholder: true` have NO results and NO narrative
       outcome. They render with a visible "Content placeholder" flag and
       exist only so the architecture is in place. Fill them with real
       project data, then remove the flag.
     · Cover images in /public/portfolio are illustrations, not screenshots.
       Alt text says so. Never describe one as a product screenshot.
     · Never add a client logo, review or financial figure that has not been
       supplied and approved by that client.
   ========================================================================== */

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "hirelyx-platform",
    title: "Hirelyx Platform",
    client: "Hirelyx (internal product)",
    category: "Python Development",
    summary:
      "Our own client platform: authentication, project tracking, invoicing, real-time messaging and Stripe payments on Next.js and Supabase.",
    image: "/portfolio/saas-analytics-dashboard.jpg",
    services: ["python-development"],
    tech: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Stripe", "Realtime"],
    challenge: [
      "We needed a single place for clients to see project status, exchange files and messages, review invoices and pay — without stitching together four SaaS products and reconciling them by hand.",
      "Because it is the system our own delivery runs on, it also had to be something a small team could maintain while shipping client work.",
    ],
    solution: [
      "A Next.js application with server-rendered marketing pages and an authenticated client area, backed by Supabase for Postgres, authentication, storage and realtime subscriptions.",
      "Row-level security policies enforce access in the database rather than the interface, so a missing UI check cannot expose another client's data. Stripe handles checkout and invoice payment, with webhook-driven state reconciled against our own records.",
    ],
    approach: [
      { title: "Data model and access policies first", desc: "Entities, roles and row-level security written before any screen, so authorisation was a property of the schema." },
      { title: "Vertical slices", desc: "Projects, then invoicing, then messaging — each shipped working end to end before the next began." },
      { title: "Payments via webhooks", desc: "Stripe events drive state transitions, with idempotent handlers so a replayed event cannot double-charge or double-credit." },
      { title: "Hardening", desc: "Security headers, a content security policy, rate limiting on public endpoints and captcha on forms." },
    ],
    results: [
      { label: "Pages deployed", value: "60+" },
      { label: "Service lines integrated", value: "6" },
      { label: "Client portal", value: "Real-time" },
    ],
    outcome: [
      "Project status, files, messages, invoices and payments now live in one system that we own outright, with no per-seat cost as the client base grows.",
    ],
    screens: [
      { src: "/portfolio/saas-analytics-dashboard.jpg", alt: "Illustration of an analytics dashboard with charts and summary tiles, representing the Hirelyx client portal" },
    ],
    year: "2026",
  },
  {
    slug: "ai-support-agent",
    title: "AI Customer Support Agent",
    client: "E-commerce retailer",
    category: "Custom AI Agents",
    summary:
      "A retrieval-grounded support agent handling FAQs, order status and product questions, with escalation to the human team.",
    image: "/portfolio/ai-support-agent.jpg",
    services: ["ai-agents", "prompt-engineering"],
    tech: ["OpenAI API", "Python", "RAG", "FastAPI", "Vector database"],
    challenge: [
      "The support inbox was dominated by a small set of repeated questions — delivery timing, returns policy, order status, product fit — asked in many different phrasings.",
      "An earlier off-the-shelf chatbot had been removed because it answered confidently from general knowledge instead of the retailer's own policies.",
    ],
    solution: [
      "A FastAPI service with a retrieval pipeline over the retailer's approved help content and policy pages, so every answer is drawn from their own material and cites where it came from.",
      "Order-status questions are answered through a scoped tool call rather than from text. Anything outside the defined scope, or below the confidence threshold, hands over to a human with the transcript attached.",
    ],
    approach: [
      { title: "Ticket clustering", desc: "Historic conversations were grouped to establish what was genuinely repetitive, which set the agent's scope." },
      { title: "Retrieval over approved content", desc: "Help centre and policy pages ingested, chunked and embedded, with a refresh routine when content changes." },
      { title: "Scoped tooling", desc: "A single read-only order-lookup tool with validated input, rather than broad database access." },
      { title: "Evaluation before launch", desc: "A graded test set built from real questions, with accuracy and failure modes reported before rollout." },
    ],
    results: [
      { label: "Support tickets", value: "70% fewer" },
      { label: "Availability", value: "24/7" },
      { label: "Languages", value: "Multilingual" },
    ],
    outcome: [
      "Repetitive queries are now resolved without a queue, and the team's time shifted to the cases that genuinely need a person.",
    ],
    screens: [
      { src: "/portfolio/ai-support-agent.jpg", alt: "Illustration of a chat interface with an AI assistant responding to a customer question" },
    ],
    year: "2026",
  },
  {
    slug: "meta-ads-campaign",
    title: "Social Media Growth Campaign",
    client: "SaaS startup",
    category: "Digital Marketing",
    summary:
      "Strategy and execution across Instagram, LinkedIn and X — content calendar, paid campaigns and analytics tracking.",
    image: "/portfolio/meta-ads-campaign.jpg",
    services: ["digital-marketing"],
    tech: ["Meta Ads", "Content Strategy", "Google Analytics 4", "SEO", "LinkedIn"],
    challenge: [
      "A pre-launch SaaS product with no organic audience and no reliable way to tell which channel was producing sign-ups.",
      "Conversion tracking had been set up once and never verified, so historic performance numbers could not be trusted.",
    ],
    solution: [
      "Analytics and conversion tracking were rebuilt and verified first, then a content calendar and paid campaign structure were launched against an agreed baseline.",
      "Creative and audience tests ran on a deliberate schedule rather than continuously, so each result was attributable to a specific change.",
    ],
    approach: [
      { title: "Measurement rebuild", desc: "Events and conversions re-implemented and reconciled before any budget decisions were made." },
      { title: "Channel selection", desc: "Effort concentrated on the two channels where the audience demonstrably was, rather than spread across five." },
      { title: "Content system", desc: "A repeatable calendar with briefs, so production did not depend on inspiration each week." },
      { title: "Structured paid testing", desc: "Audience and creative varied one at a time, with results logged per test." },
    ],
    results: [
      { label: "Follower growth", value: "3x in 3 months" },
      { label: "Engagement", value: "+45%" },
      { label: "Publishing", value: "Consistent calendar" },
    ],
    outcome: [
      "The product launched with an existing audience and a reporting setup the founders could audit themselves.",
    ],
    screens: [
      { src: "/portfolio/meta-ads-campaign.jpg", alt: "Illustration of a social media advertising dashboard showing campaign performance charts" },
    ],
    year: "2026",
  },
  {
    slug: "short-form-video-engine",
    title: "AI Video & Animation Pipeline",
    client: "Content creator business",
    category: "Digital Marketing",
    summary:
      "An assisted production pipeline for daily short-form video: AI visuals, voiceover synthesis and automated editing steps.",
    image: "/portfolio/short-form-video-engine.jpg",
    services: ["digital-marketing", "ai-agents"],
    tech: ["AI video", "ElevenLabs", "n8n", "FFmpeg", "Automation"],
    challenge: [
      "Publishing daily short-form video required the same manual sequence every time: script, voiceover, visual selection, edit, caption, export, upload.",
      "The bottleneck was not creative judgement — it was the repetitive assembly around it.",
    ],
    solution: [
      "An n8n-orchestrated pipeline that handles the mechanical steps: voiceover synthesis, visual generation, FFmpeg assembly, caption burn-in and scheduled upload.",
      "Scripts and final approval stayed human. The automation handles everything between an approved script and a published file.",
    ],
    approach: [
      { title: "Step timing audit", desc: "Each manual step was timed, which made it obvious where automation would and would not pay back." },
      { title: "Template-driven assembly", desc: "Brand-consistent templates for timing, type and transitions, so output quality did not depend on the operator." },
      { title: "Human approval gate", desc: "Nothing publishes without a person approving the script and the rendered result." },
      { title: "Failure handling", desc: "Failed renders alert and retry rather than silently skipping a day's publication." },
    ],
    results: [
      { label: "Videos per month", value: "30 automated" },
      { label: "Production time", value: "50% saved" },
      { label: "Output", value: "Consistent brand style" },
    ],
    outcome: [
      "Daily publishing became sustainable for one person, with creative decisions still made by a human.",
    ],
    screens: [
      { src: "/portfolio/short-form-video-engine.jpg", alt: "Illustration of a video editing timeline with short-form vertical video frames" },
    ],
    year: "2026",
  },
  {
    slug: "prompt-library",
    title: "E-commerce Prompt Library",
    client: "E-commerce brand",
    category: "Prompt Engineering",
    summary:
      "A documented prompt system for product descriptions, email sequences and ad copy, with A/B tested variants.",
    image: null,
    services: ["prompt-engineering"],
    tech: ["Anthropic Claude", "OpenAI GPT", "Structured output", "A/B testing"],
    challenge: [
      "Content was being generated ad hoc by several people, each with their own prompts, so brand voice drifted between a product page and an email.",
      "There was no way to tell whether a prompt change made output better or merely different.",
    ],
    solution: [
      "A versioned prompt library organised by use case, with a shared system prompt carrying brand voice and constraints, and per-task prompts layered on top.",
      "An evaluation set drawn from real briefs, with grading criteria, so each change could be measured rather than argued about.",
    ],
    approach: [
      { title: "Voice specification", desc: "Brand voice written down as explicit constraints instead of adjectives, so a model could follow it." },
      { title: "Use-case decomposition", desc: "Product copy, email and ad copy treated as separate tasks with separate output contracts." },
      { title: "Graded iteration", desc: "Variants scored against the evaluation set; only measured improvements were kept." },
      { title: "Handover", desc: "Library, grading harness and a change process documented for the brand's own team." },
    ],
    results: [
      { label: "Prompts delivered", value: "200+" },
      { label: "Content production", value: "60% faster" },
      { label: "Brand voice", value: "Consistent across channels" },
    ],
    outcome: [
      "The team now produces on-brand copy from a shared library, and can tell whether a change to it actually helped.",
    ],
    screens: [],
    year: "2026",
  },
  {
    slug: "workflow-automation",
    title: "Business Workflow Automation",
    client: "Digital agency",
    category: "Custom AI Agents",
    summary:
      "End-to-end automation of CRM sync, invoice generation, client onboarding, notifications and reporting.",
    image: null,
    services: ["ai-agents", "python-development"],
    tech: ["n8n", "Airtable", "Slack API", "Google Sheets", "Webhooks"],
    challenge: [
      "A dozen small manual steps sat between winning a project and starting it: creating records in three systems, generating an invoice, setting up a channel, sending onboarding instructions.",
      "Each step was individually trivial, collectively expensive, and occasionally skipped without anyone noticing.",
    ],
    solution: [
      "n8n workflows triggered by a single status change, writing to each downstream system through its API with idempotency keys so a replay cannot duplicate records.",
      "Weekly reporting was moved from manual assembly to a scheduled pipeline, and failures alert into Slack with the failing step and input.",
    ],
    approach: [
      { title: "Process mapping", desc: "The onboarding sequence was recorded step by step with the person who performed it, including the exceptions." },
      { title: "Single trigger design", desc: "One status change drives the whole sequence, which removed the ordering mistakes entirely." },
      { title: "Idempotent writes", desc: "Every downstream write is keyed, so retries are safe and duplicates are impossible." },
      { title: "Observability", desc: "Run logs and Slack alerts, so a failure is noticed in minutes rather than at month end." },
    ],
    results: [
      { label: "Time saved", value: "15 hrs/week" },
      { label: "Manual data entry", value: "Eliminated" },
      { label: "Team notifications", value: "Real-time" },
    ],
    outcome: [
      "Onboarding now runs from one status change, and nothing in the sequence depends on anyone remembering it.",
    ],
    screens: [],
    year: "2026",
  },

  /* ── Structural placeholders — no results, visibly flagged ────────────── */
  {
    slug: "wordpress-ecommerce-build",
    title: "WordPress E-commerce Build",
    client: "To be confirmed",
    category: "WordPress Development",
    summary:
      "Reserved for a WooCommerce build case study: custom block theme, catalogue performance work and checkout customisation.",
    image: "/portfolio/ecommerce-storefront.jpg",
    services: ["wordpress-development", "digital-marketing"],
    tech: ["WordPress", "WooCommerce", "PHP", "theme.json", "Core Web Vitals"],
    challenge: [
      "Placeholder. Replace with the client's actual problem — current platform, performance baseline, catalogue size and the specific constraint that made a custom build necessary.",
    ],
    solution: [
      "Placeholder. Replace with what was built: theme architecture, block patterns, checkout changes, integrations and the performance work carried out.",
    ],
    approach: [
      { title: "Audit", desc: "Placeholder — record the measured baseline before work begins." },
      { title: "Build", desc: "Placeholder — describe the theme and template architecture delivered." },
      { title: "Performance pass", desc: "Placeholder — list the optimisations and their measured effect." },
      { title: "Launch", desc: "Placeholder — redirect map, verification crawl, and what was handed over." },
    ],
    results: [],
    outcome: [],
    screens: [],
    year: "—",
    placeholder: true,
  },
  {
    slug: "seo-content-engine",
    title: "SEO & Content Engine",
    client: "To be confirmed",
    category: "Digital Marketing",
    summary:
      "Reserved for an organic growth case study: technical SEO remediation, content architecture and measured ranking movement.",
    image: "/portfolio/seo-content-engine.jpg",
    services: ["digital-marketing", "wordpress-development"],
    tech: ["Google Search Console", "Google Analytics 4", "Schema.org", "Content strategy"],
    challenge: [
      "Placeholder. Replace with the client's starting position — indexation issues, content gaps, competitive set and the baseline traffic figures.",
    ],
    solution: [
      "Placeholder. Replace with the technical fixes applied, the content architecture introduced, and how internal linking was restructured.",
    ],
    approach: [
      { title: "Technical audit", desc: "Placeholder — crawl, index and speed findings with the prioritised fix list." },
      { title: "Content architecture", desc: "Placeholder — the intent map and the page structure it produced." },
      { title: "Execution", desc: "Placeholder — publication cadence and on-page work delivered." },
      { title: "Measurement", desc: "Placeholder — leading indicators tracked and the reporting handed over." },
    ],
    results: [],
    outcome: [],
    screens: [],
    year: "—",
    placeholder: true,
  },
  {
    slug: "mcp-server-integration",
    title: "MCP Server Integration",
    client: "To be confirmed",
    category: "MCP Server Development",
    summary:
      "Reserved for an MCP case study: internal systems exposed to AI assistants as typed, scoped, audited tools.",
    image: null,
    services: ["mcp-server-development", "ai-agents"],
    tech: ["Model Context Protocol", "Python", "FastAPI", "Pydantic", "OAuth 2.0"],
    challenge: [
      "Placeholder. Replace with the systems involved, who needed assistant access to them, and the access-control constraints that applied.",
    ],
    solution: [
      "Placeholder. Replace with the tools and resources exposed, the permission model, and how calls are audited.",
    ],
    approach: [
      { title: "Capability mapping", desc: "Placeholder — the questions and actions that became tools and resources." },
      { title: "Contract design", desc: "Placeholder — input and output schemas, error taxonomy and scopes." },
      { title: "Security review", desc: "Placeholder — the boundaries checked and what was deliberately not exposed." },
      { title: "Rollout", desc: "Placeholder — clients configured and the runbook delivered." },
    ],
    results: [],
    outcome: [],
    screens: [],
    year: "—",
    placeholder: true,
  },
];

/** Filter categories, in canonical order, derived from the data. */
export const CASE_CATEGORIES: string[] = Array.from(
  new Set(CASE_STUDIES.map((study) => study.category)),
);

export const CASE_SLUGS = CASE_STUDIES.map((study) => study.slug);

const CASE_INDEX = new Map(CASE_STUDIES.map((study) => [study.slug, study]));

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_INDEX.get(slug);
}

export function caseStudiesBySlug(slugs: readonly string[]): CaseStudy[] {
  return slugs
    .map((slug) => CASE_INDEX.get(slug))
    .filter((study): study is CaseStudy => Boolean(study));
}

/** Case studies that reference a given service slug. */
export function caseStudiesForService(serviceSlug: string): CaseStudy[] {
  return CASE_STUDIES.filter((study) => study.services.includes(serviceSlug));
}
