import type { ExpertiseArea, Industry } from "./types";

/* ==========================================================================
   HIRELYX · EXPERTISE & INDUSTRIES
   --------------------------------------------------------------------------
   Expertise areas describe the technologies we genuinely work in and what we
   build with them. Each gets a page at /expertise/<slug>; the hub at
   /expertise lists them all. Industries are presented on the hub and the
   homepage only — we do not publish thin per-industry pages.
   ========================================================================== */

export const EXPERTISE: ExpertiseArea[] = [
  {
    slug: "python",
    name: "Python",
    title: "Python Expertise",
    metaTitle: "Python Expertise — Services, Workers, Data & Integrations",
    metaDescription:
      "How Hirelyx uses Python: FastAPI and Django services, Pydantic validation, Pytest suites, Celery workers and typed integration clients.",
    tagline: "The language most of our backend work is written in.",
    summary:
      "Services, workers, integrations and data pipelines — written with types at the boundaries and tests around behaviour.",
    glyph: "python",
    stack: [
      { name: "Python 3.12+", note: "Modern typing features used throughout, so editors and CI catch mistakes before review does." },
      { name: "FastAPI", note: "Our default for API services: typed routing, async I/O and OpenAPI docs generated from the code." },
      { name: "Django", note: "Chosen when the admin, ORM and conventions genuinely save months on a content- or CRUD-heavy product." },
      { name: "Pydantic", note: "Validation and settings. Request, response and config shapes are declared once and reused." },
      { name: "Pytest", note: "Fixtures, factories and parametrised cases, wired into CI so coverage is enforced rather than reported." },
      { name: "SQLAlchemy", note: "Used where explicit query control matters more than ORM convenience." },
      { name: "Celery + Redis", note: "Durable background work and scheduling, built to be idempotent and replayable." },
      { name: "Docker", note: "Identical environments locally, in CI and in production — the cheapest class of bug to eliminate." },
    ],
    applications: [
      { title: "API services", desc: "Public and internal APIs with authentication, pagination, versioning and rate limiting designed before implementation." },
      { title: "Integration layers", desc: "Typed clients around third-party APIs with retries, timeouts and explicit error handling, so drift surfaces as a test failure." },
      { title: "Background processing", desc: "Queues and scheduled jobs for imports, exports, notifications and anything that must survive a restart." },
      { title: "AI application backends", desc: "The service layer behind agents and retrieval systems: orchestration, validation, logging and cost control." },
    ],
    services: ["python-development", "ai-agents", "mcp-server-development"],
    keywords: ["python development", "fastapi", "django", "python backend"],
  },
  {
    slug: "fastapi",
    name: "FastAPI, Pydantic & Pytest",
    title: "FastAPI, Pydantic and Pytest",
    metaTitle: "FastAPI, Pydantic & Pytest Expertise — Typed, Tested APIs",
    metaDescription:
      "How Hirelyx builds API services: FastAPI routing and dependencies, Pydantic contracts at the boundary, and Pytest suites that make a green build meaningful.",
    tagline: "Three tools that make a Python API predictable.",
    summary:
      "Typed routing, validated contracts and a test suite that means something — the combination we reach for on nearly every API engagement.",
    glyph: "terminal",
    stack: [
      { name: "FastAPI routing", note: "Path, query and body parameters are typed, so the signature is the specification." },
      { name: "Dependency injection", note: "Auth, database sessions and configuration injected per request, which makes handlers trivial to test." },
      { name: "Async I/O", note: "Used where the service is I/O-bound. We do not make everything async for its own sake." },
      { name: "OpenAPI generation", note: "Documentation derived from the code, so it cannot drift from the implementation." },
      { name: "Pydantic models", note: "Request, response, settings and message payloads validated at the boundary, with precise errors." },
      { name: "Pydantic settings", note: "Environment configuration parsed and validated at startup, so a bad deploy fails immediately and loudly." },
      { name: "Pytest fixtures", note: "Database isolation per test, factory helpers and shared setup without hidden coupling." },
      { name: "Coverage and CI", note: "Suite runs on every change; coverage is reported and gaps are named rather than ignored." },
    ],
    applications: [
      { title: "Contract-first delivery", desc: "Schemas and route signatures are agreed and published first, so frontend and backend work proceed in parallel." },
      { title: "Validated boundaries", desc: "Malformed input is rejected at the edge with a documented error instead of reaching business logic." },
      { title: "Regression safety", desc: "Behaviour is pinned by tests before refactoring, which is what makes later changes cheap." },
      { title: "Self-documenting APIs", desc: "Consumers get accurate, generated OpenAPI docs they can explore and generate clients from." },
    ],
    services: ["python-development", "mcp-server-development", "ai-agents"],
    keywords: ["fastapi development", "pydantic validation", "pytest testing", "typed python api"],
  },
  {
    slug: "react-nextjs",
    name: "React & Next.js",
    title: "React and Next.js",
    metaTitle: "React & Next.js Expertise — Server-First Front Ends",
    metaDescription:
      "How Hirelyx builds front ends: Next.js App Router, React server components, TypeScript throughout, and client JavaScript only where interaction requires it.",
    tagline: "Server-rendered by default, interactive where it matters.",
    summary:
      "Next.js App Router with React server components and TypeScript — fast first paint, real URLs, and client-side code kept to what interaction actually needs.",
    glyph: "layers",
    stack: [
      { name: "Next.js App Router", note: "File-based routing with layouts, streaming and metadata generated per route." },
      { name: "React server components", note: "Content renders on the server by default, so pages ship markup instead of a loading state." },
      { name: "TypeScript", note: "Strict mode across the codebase. Props, API responses and route params are all typed." },
      { name: "Server actions and route handlers", note: "Mutations and API endpoints colocated with the feature that uses them." },
      { name: "next/font and next/image", note: "Self-hosted fonts and responsive images, which is most of a Core Web Vitals score." },
      { name: "Design tokens in CSS", note: "A token layer in plain CSS custom properties — no runtime style engine in the critical path." },
      { name: "Accessibility patterns", note: "Semantic landmarks, focus management, keyboard support and respected reduced-motion preferences." },
      { name: "Supabase client", note: "Authentication and data access with row-level security enforced in the database, not the UI." },
    ],
    applications: [
      { title: "Marketing sites that score well", desc: "Static or server-rendered pages with per-route metadata, structured data and measured Core Web Vitals." },
      { title: "Authenticated product UI", desc: "Dashboards, portals and settings areas with server-side access control rather than hidden buttons." },
      { title: "Content architecture", desc: "Dynamic routes driven by typed content modules or a CMS, so new pages do not need new layout code." },
      { title: "Incremental modernisation", desc: "Moving a legacy front end route by route, keeping both running, instead of a single risky rewrite." },
    ],
    services: ["python-development", "wordpress-development"],
    keywords: ["next.js development", "react development", "server components", "typescript frontend"],
  },
  {
    slug: "ai-and-llms",
    name: "AI & LLM Engineering",
    title: "AI and LLM Engineering",
    metaTitle: "AI & LLM Engineering Expertise — Retrieval, Agents & Evaluation",
    metaDescription:
      "How Hirelyx engineers LLM systems: OpenAI and Claude APIs, LangChain orchestration, retrieval pipelines, structured output and graded evaluation sets.",
    tagline: "Model calls are the easy part. The engineering is around them.",
    summary:
      "Retrieval pipelines, tool layers, structured output and evaluation harnesses — the scaffolding that turns a model call into a system you can depend on.",
    glyph: "spark",
    stack: [
      { name: "Anthropic Claude API", note: "Our usual choice for long-context reasoning, careful instruction following and tool use." },
      { name: "OpenAI API", note: "Used for its embedding models, structured output modes and where latency or cost profile fits better." },
      { name: "LangChain", note: "Used selectively for orchestration and retrieval plumbing, not as a framework we build the whole system inside." },
      { name: "Model Context Protocol", note: "The standard we use to expose systems to assistants as typed tools and resources." },
      { name: "Vector search", note: "Embedding, chunking and reranking tuned for the shape of the source documents, not a default setting." },
      { name: "Structured output", note: "Schema-constrained responses validated with Pydantic, so downstream code gets data rather than prose." },
      { name: "Evaluation harnesses", note: "Graded test sets from real inputs, run on every prompt or model change to catch regressions." },
      { name: "Cost and latency instrumentation", note: "Per-request token and timing data, so tuning decisions rest on numbers." },
    ],
    applications: [
      { title: "Retrieval over your content", desc: "Ingestion, chunking, embedding and refresh pipelines that keep answers grounded in current sources with citations." },
      { title: "Tool-using agents", desc: "Typed tool definitions with permission boundaries, letting an agent look things up and act within hard limits." },
      { title: "Document understanding", desc: "Extraction into validated schemas with confidence scoring and review queues for uncertain cases." },
      { title: "Evaluation and monitoring", desc: "Accuracy baselines, regression runs and dashboards covering cost, latency and fallback rate." },
    ],
    services: ["ai-agents", "prompt-engineering", "mcp-server-development"],
    keywords: ["llm engineering", "rag pipeline", "openai api development", "claude api development", "ai evaluation"],
  },
  {
    slug: "automation-and-integrations",
    name: "Automation & Integrations",
    title: "Automation and Integrations",
    metaTitle: "Automation & Integration Expertise — n8n, APIs & Webhooks",
    metaDescription:
      "How Hirelyx connects systems: n8n workflows, webhook handling, typed API clients, Stripe and Supabase integration, with retries and observable run logs.",
    tagline: "The connective tissue between the tools you already pay for.",
    summary:
      "n8n workflows, webhook endpoints and typed API clients that move data between your systems reliably — with retries, idempotency and logs you can read.",
    glyph: "integration",
    stack: [
      { name: "n8n", note: "Self-hosted or cloud. Our default for workflow automation when logic should stay visible and editable by your team." },
      { name: "Webhooks", note: "Signature-verified endpoints with idempotency keys, so a duplicate delivery does not duplicate the effect." },
      { name: "REST and GraphQL clients", note: "Typed wrappers with retries, timeouts and backoff instead of bare HTTP calls scattered through the code." },
      { name: "Stripe", note: "Checkout, invoices and webhook handling, with payment state reconciled against your own records." },
      { name: "Supabase", note: "Postgres, authentication, storage and realtime, with row-level security policies written explicitly." },
      { name: "Message queues", note: "Redis and database-backed queues for work that must survive restarts and be replayable." },
      { name: "Scheduled jobs", note: "Cron-style runs built to be idempotent, so a missed window can be safely re-run." },
      { name: "Structured logging", note: "Correlation IDs across steps, so one failed run can be traced end to end." },
    ],
    applications: [
      { title: "System-to-system sync", desc: "Keeping records consistent between CRM, billing, support and internal databases without manual re-entry." },
      { title: "Event-driven processes", desc: "A form submission, payment or status change triggering the rest of the process automatically." },
      { title: "Reporting pipelines", desc: "Scheduled collection and transformation into the dashboard your team already looks at." },
      { title: "Payment and billing flows", desc: "Checkout, invoicing and reconciliation wired to your own data model with webhook-driven state." },
    ],
    services: ["ai-agents", "python-development", "mcp-server-development"],
    keywords: ["n8n development", "api integration services", "webhook development", "stripe integration"],
  },
];

export const EXPERTISE_SLUGS = EXPERTISE.map((area) => area.slug);

const EXPERTISE_INDEX = new Map(EXPERTISE.map((area) => [area.slug, area]));

export function getExpertise(slug: string): ExpertiseArea | undefined {
  return EXPERTISE_INDEX.get(slug);
}

/* ────────────────────────────────────────────────────────── INDUSTRIES ─── */

export const INDUSTRIES: Industry[] = [
  {
    slug: "saas-and-startups",
    name: "SaaS & Startups",
    summary:
      "Early product teams that need a backend, an API and a working release pipeline faster than hiring allows.",
    useCases: ["MVP backend and API", "Billing and subscription flows", "Admin and internal tooling", "Analytics instrumentation"],
    glyph: "software",
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    summary:
      "Agencies, consultancies and practices where the margin sits in how efficiently work is coordinated and billed.",
    useCases: ["Client portal and project tracking", "Proposal and invoice automation", "Document generation", "Onboarding workflows"],
    glyph: "users",
  },
  {
    slug: "ecommerce-and-retail",
    name: "E-commerce & Retail",
    summary:
      "Online retailers who need storefront performance, clean tracking and support that scales through peak periods.",
    useCases: ["WooCommerce builds and speed work", "Product feed and catalogue sync", "Meta Ads and conversion tracking", "Support deflection"],
    glyph: "growth",
  },
  {
    slug: "education-and-training",
    name: "Education & Training",
    summary:
      "Course providers and training businesses with content to deliver, cohorts to manage and enquiries to answer.",
    useCases: ["Course and content sites", "Enrolment and payment flows", "Grounded student Q&A assistants", "Progress reporting"],
    glyph: "layers",
  },
  {
    slug: "operations-heavy-businesses",
    name: "Operations-Heavy Businesses",
    summary:
      "Logistics, field service and back-office teams running critical processes on spreadsheets and shared inboxes.",
    useCases: ["Process automation", "Document extraction", "Internal dashboards", "System-to-system integration"],
    glyph: "automation",
  },
  {
    slug: "content-and-media",
    name: "Content & Media",
    summary:
      "Publishers and creator businesses where production throughput and organic discovery decide the outcome.",
    useCases: ["Publishing platforms", "Technical SEO and content architecture", "AI-assisted production workflows", "Analytics and attribution"],
    glyph: "analytics",
  },
];
