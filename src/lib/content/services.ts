import type { Service } from "./types";

/* ==========================================================================
   HIRELYX · SERVICES
   --------------------------------------------------------------------------
   Six service lines, each with its own landing page at /services/<slug>.

   PRICING PROVENANCE — read before editing:
     · python-development    — price points carried over from the previous
                               "Programming & Tech" service, unchanged.
     · digital-marketing     — carried over from "Digital Marketing", unchanged.
     · ai-agents             — carried over from "Custom AI Agents", unchanged.
     · prompt-engineering    — carried over from "Prompt Engineering", unchanged.
     · wordpress-development — reuses the web-build price points above (the
                               Starter tier already described "landing page or
                               simple website"); feature lists rewritten for
                               WordPress. Confirm before publishing.
     · mcp-server-development— quote-only. No prices invented.

   Legacy slugs `programming`, `marketing`, `prompt`, `social-ai` and `n8n`
   are 301-redirected in next.config.ts — do not delete those redirects.
   ========================================================================== */

export const SERVICES: Service[] = [
  /* ────────────────────────────────────────────────────────── PYTHON ───── */
  {
    slug: "python-development",
    name: "Python Development",
    title: "Python Development Services",
    metaTitle: "Python Development Services — FastAPI, Pydantic & Pytest",
    metaDescription:
      "Hirelyx builds production Python backends: FastAPI services, Pydantic-validated data contracts, Pytest coverage, and APIs that integrate cleanly with the rest of your stack.",
    tagline: "Typed, tested Python backends that hold up in production.",
    summary:
      "FastAPI services, data-validation layers and automated test suites — Python backends built to be read, extended and trusted by whoever maintains them next.",
    intro: [
      "Most Python problems we are asked to fix are not language problems. They are missing contracts: an endpoint that accepts whatever arrives, a background job nobody can reproduce locally, a test suite that passes because it asserts almost nothing.",
      "We build Python the other way round. Request and response shapes are declared with Pydantic before a handler exists. Behaviour is pinned by Pytest before it ships. FastAPI gives us typed routing and generated OpenAPI documentation your frontend team can work against on day one.",
    ],
    glyph: "python",
    problems: [
      {
        title: "Endpoints that fail in unclear ways",
        desc: "Untyped payloads reach business logic and surface as 500s. We push validation to the boundary so bad input is rejected with a precise, documented error instead of corrupting state.",
      },
      {
        title: "Nobody trusts the test suite",
        desc: "We write Pytest suites around real behaviour — fixtures, parametrised cases, and database isolation — so a green run is evidence rather than decoration.",
      },
      {
        title: "Integrations that silently drift",
        desc: "Third-party APIs change. We wrap them in typed clients with explicit error handling, retries and logging, so drift shows up as a failing test, not a support ticket.",
      },
      {
        title: "Scripts that became infrastructure",
        desc: "A one-off script now runs payroll. We turn that into a maintainable service with configuration, structured logging and a rollback path.",
      },
    ],
    capabilities: [
      {
        title: "FastAPI service development",
        desc: "Typed routing, dependency injection, async I/O, background tasks and auto-generated OpenAPI schemas your client teams can consume directly.",
      },
      {
        title: "Pydantic data contracts",
        desc: "Models for requests, responses, settings and message payloads — validated at the edge, serialised consistently, and reused across services.",
      },
      {
        title: "Pytest test engineering",
        desc: "Unit, integration and contract tests with fixtures, factories and CI wiring; coverage reporting so gaps are visible rather than assumed.",
      },
      {
        title: "REST & GraphQL API design",
        desc: "Resource modelling, pagination, versioning, authentication and rate limiting designed before implementation starts.",
      },
      {
        title: "Database and data-layer work",
        desc: "PostgreSQL schema design, migrations, query tuning and the ORM or query-builder choice that actually fits the access pattern.",
      },
      {
        title: "Deployment and CI/CD",
        desc: "Dockerised services, environment separation, secret handling and pipelines that run the test suite before anything reaches production.",
      },
    ],
    deliverables: [
      "FastAPI application with typed routes and dependency graph",
      "Pydantic models for every request, response and settings object",
      "Pytest suite with fixtures, factories and coverage report",
      "OpenAPI / Swagger documentation generated from the code",
      "PostgreSQL schema with versioned migrations",
      "Dockerfile and CI pipeline configuration",
      "Structured logging and error-reporting hooks",
      "Handover documentation and a walkthrough session",
    ],
    tech: [
      "Python",
      "FastAPI",
      "Pydantic",
      "Pytest",
      "Django",
      "SQLAlchemy",
      "PostgreSQL",
      "Supabase",
      "Docker",
      "Redis",
      "Celery",
      "OpenAPI",
    ],
    process: [
      { title: "Requirements and data modelling", desc: "We map the entities, access patterns and integration points before any endpoint is written." },
      { title: "Contract-first API design", desc: "Pydantic schemas and route signatures are agreed and published so frontend work can start in parallel." },
      { title: "Implementation in vertical slices", desc: "Each slice ships with its own tests, so progress is demonstrable rather than described." },
      { title: "Hardening", desc: "Load behaviour, error paths, timeouts, retries, logging and authentication are tested explicitly." },
      { title: "Deployment and handover", desc: "CI/CD wiring, environment configuration, documentation and a live walkthrough with your team." },
    ],
    tiers: [
      {
        name: "Starter",
        price: "$499",
        period: "per project",
        desc: "A focused service or integration with a clear boundary.",
        features: [
          "Single FastAPI service or integration",
          "Pydantic request/response models",
          "Core Pytest coverage",
          "OpenAPI documentation",
          "1 round of revisions",
        ],
        cta: "Scope this tier",
      },
      {
        name: "Professional",
        price: "$1,499",
        period: "per project",
        desc: "A full backend: API, database, auth and test suite.",
        features: [
          "Multi-router FastAPI application",
          "PostgreSQL schema and migrations",
          "Authentication and authorisation",
          "Integration + unit test suite",
          "Dockerfile and CI pipeline",
          "3 rounds of revisions",
        ],
        highlighted: true,
        cta: "Most requested",
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "quote",
        desc: "Platform-scale work, multiple services, ongoing delivery.",
        features: [
          "Service decomposition and architecture",
          "Multiple third-party integrations",
          "Background workers and scheduling",
          "Performance and load testing",
          "Unlimited revisions in scope",
          "3 months post-launch support",
        ],
        cta: "Request a proposal",
      },
    ],
    faqs: [
      {
        q: "Why FastAPI rather than Django or Flask?",
        a: "FastAPI is our default for API-first work because typing, validation and documentation come from the same source — the Pydantic models. We use Django when you need its admin, ORM and batteries-included conventions for a content-heavy or CRUD-heavy product, and Flask when you are extending something already built on it. The decision is made in discovery, with reasons written down.",
      },
      {
        q: "Will the test suite actually be useful after handover?",
        a: "That is the point of it. We write tests against behaviour rather than implementation details, use factories instead of brittle fixtures where it helps, and wire the suite into CI so it runs on every change. You get a coverage report and a short document explaining what is covered and what deliberately is not.",
      },
      {
        q: "Can you work on an existing Python codebase?",
        a: "Yes. We usually start with a read-only review: dependency state, test coverage, obvious correctness risks and the two or three changes that would most reduce maintenance cost. You get that assessment as a written document before any refactoring is agreed.",
      },
      {
        q: "Who owns the code?",
        a: "You do. Work is delivered in your repository, under your accounts, with no runtime dependency on Hirelyx infrastructure.",
      },
      {
        q: "How do you handle long-running or scheduled work?",
        a: "Background tasks go through Celery or FastAPI background tasks depending on durability requirements, with Redis or a database-backed queue. Scheduled jobs are idempotent and observable, so a missed run can be replayed safely.",
      },
    ],
    relatedWork: ["hirelyx-platform", "ai-support-agent"],
    relatedSolutions: ["custom-software", "ai-powered-workflows"],
    keywords: [
      "python development services",
      "fastapi development company",
      "pydantic data validation",
      "pytest test automation",
      "python backend development",
      "hire python developer",
    ],
  },

  /* ─────────────────────────────────────────────────────── WORDPRESS ───── */
  {
    slug: "wordpress-development",
    name: "WordPress Development",
    title: "WordPress Development Services",
    metaTitle: "WordPress Development Services — Custom Themes, Speed & SEO",
    metaDescription:
      "Custom WordPress development from Hirelyx: hand-built themes, clean block editing, Core Web Vitals work, WooCommerce, secure hosting setup and technical SEO foundations.",
    tagline: "WordPress built like software, not assembled from plugins.",
    summary:
      "Custom themes, editor-friendly block patterns, measurable performance work and technical SEO foundations — WordPress sites your marketing team can actually run.",
    intro: [
      "A WordPress site is usually slow and fragile for the same reason: it was assembled. A page builder, a dozen plugins that each ship their own CSS, and a theme nobody can safely update. Every change becomes a risk.",
      "We build WordPress the way we build applications. A purpose-made theme, native block patterns your editors understand, the smallest viable plugin set, and performance measured before and after rather than promised.",
    ],
    glyph: "wordpress",
    problems: [
      {
        title: "The site is slow and you cannot see why",
        desc: "We profile what is actually loading — render-blocking assets, unoptimised images, plugin bloat, database queries — and fix the causes, with before-and-after measurements.",
      },
      {
        title: "Editing breaks the layout",
        desc: "We ship registered block patterns and constrained theme settings, so content changes stay inside the design system instead of escaping it.",
      },
      {
        title: "Plugin sprawl and update anxiety",
        desc: "We reduce the plugin set, replace what can be handled in the theme, and set up a staging environment so updates are tested rather than hoped through.",
      },
      {
        title: "Technical SEO was never set up",
        desc: "Heading structure, metadata, canonical handling, sitemaps, schema and redirects get built in rather than bolted on by a plugin default.",
      },
    ],
    capabilities: [
      {
        title: "Custom theme development",
        desc: "Block themes built from your design system — templates, patterns, theme.json tokens — with no page-builder dependency.",
      },
      {
        title: "Block editor experience",
        desc: "Reusable patterns, locked layouts and sensible defaults so non-technical editors can publish confidently.",
      },
      {
        title: "Performance and Core Web Vitals",
        desc: "Asset strategy, image pipeline, caching, font loading and database cleanup — measured against LCP, CLS and INP.",
      },
      {
        title: "WooCommerce builds",
        desc: "Product architecture, checkout customisation, payment and shipping configuration, and performance work on catalogue pages.",
      },
      {
        title: "Migrations and redesigns",
        desc: "Moving platforms or redesigning without losing rankings: URL mapping, 301 plans, and content parity checks.",
      },
      {
        title: "Security and maintenance setup",
        desc: "Hardened configuration, least-privilege roles, backups, staging workflow and an update routine your team can follow.",
      },
    ],
    deliverables: [
      "Custom block theme with theme.json design tokens",
      "Registered block patterns for every page type",
      "Responsive templates verified on mobile, tablet and desktop",
      "Core Web Vitals report before and after",
      "Technical SEO setup: metadata, sitemap, schema, redirects",
      "Staging environment and deployment routine",
      "Backup and update procedure documentation",
      "Editor training walkthrough for your team",
    ],
    tech: [
      "WordPress",
      "PHP",
      "Block Editor (Gutenberg)",
      "theme.json",
      "WooCommerce",
      "ACF",
      "MySQL",
      "WP-CLI",
      "Core Web Vitals",
      "Schema.org",
    ],
    process: [
      { title: "Audit and inventory", desc: "Current performance, plugin set, content model, URL structure and ranking pages are documented first." },
      { title: "Content and template modelling", desc: "We define post types, taxonomies and the template set, so structure drives the build." },
      { title: "Theme build", desc: "Design tokens into theme.json, templates and block patterns, built against real content." },
      { title: "Performance pass", desc: "Measured optimisation of assets, images, caching and queries, with numbers recorded at each step." },
      { title: "SEO and launch", desc: "Redirect map applied, metadata and schema verified, sitemap submitted, and post-launch crawl checked." },
    ],
    tiers: [
      {
        name: "Starter",
        price: "$499",
        period: "per project",
        desc: "A compact marketing site or landing page.",
        features: [
          "Up to 5 pages",
          "Custom block patterns",
          "Responsive across breakpoints",
          "Contact form and spam protection",
          "Technical SEO foundations",
          "1 round of revisions",
        ],
        cta: "Scope this tier",
      },
      {
        name: "Professional",
        price: "$1,499",
        period: "per project",
        desc: "A full custom theme with a real content model.",
        features: [
          "Up to 15 pages and templates",
          "Custom post types and taxonomies",
          "Core Web Vitals optimisation pass",
          "Blog / insights architecture",
          "Staging environment and deploy routine",
          "3 rounds of revisions",
        ],
        highlighted: true,
        cta: "Most requested",
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "quote",
        desc: "WooCommerce, migrations or multi-site estates.",
        features: [
          "WooCommerce or multi-site setup",
          "Platform migration with redirect map",
          "Third-party and CRM integrations",
          "Advanced performance engineering",
          "Editor training programme",
          "3 months post-launch support",
        ],
        cta: "Request a proposal",
      },
    ],
    pricingNote:
      "WordPress tiers use the same price points as our other web builds. Fixed-scope quotes are confirmed in writing after discovery — nothing starts on an estimate alone.",
    faqs: [
      {
        q: "Do you use page builders like Elementor or Divi?",
        a: "Not for new builds. Page builders add significant front-end weight and lock your content into proprietary markup. We build block themes using the native editor, which keeps pages fast and keeps your content portable. If you already run a builder and want to keep it, we will work within it and say clearly what that costs in performance.",
      },
      {
        q: "Can my team edit pages without breaking the design?",
        a: "Yes — that is what block patterns and theme.json constraints are for. Editors compose pages from approved patterns with a controlled set of colours, spacing and type styles, so the design system holds.",
      },
      {
        q: "Will a redesign hurt my search rankings?",
        a: "It can, if URLs change without a plan. We inventory your indexed URLs and ranking pages first, produce a redirect map, keep heading structure and internal linking intact, and re-crawl after launch to catch anything broken.",
      },
      {
        q: "Do you handle hosting?",
        a: "We configure and harden hosting you own, and we will recommend options that match your traffic and budget. We do not resell hosting, so the recommendation has no margin attached to it.",
      },
      {
        q: "What performance can you actually promise?",
        a: "We promise measurement and method, not a number. You get a baseline report, a prioritised list of fixes with expected impact, and a verified report after the work. On most plugin-heavy sites the available gains are large, but we will not quote a score before seeing the site.",
      },
    ],
    relatedWork: ["wordpress-ecommerce-build", "seo-content-engine"],
    relatedSolutions: ["digital-growth", "custom-software"],
    keywords: [
      "wordpress development services",
      "custom wordpress theme development",
      "woocommerce development",
      "wordpress speed optimisation",
      "hire wordpress developer",
    ],
  },

  /* ────────────────────────────────────────────────── DIGITAL MARKETING ── */
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    title: "Digital Marketing Services",
    metaTitle: "Digital Marketing Services — SEO, Analytics, Social & Meta Ads",
    metaDescription:
      "SEO, web analytics, social media marketing and Meta Ads from Hirelyx. Tracking built before spend, reporting you can audit, and a clear line from channel to revenue.",
    tagline: "Measurement first, then spend.",
    summary:
      "SEO, web analytics, social media marketing and Meta Ads — run on tracking that is correct before budget moves, and reported in numbers you can verify yourself.",
    intro: [
      "Most marketing reports we are shown cannot be checked. Conversions are counted twice, a channel takes credit for traffic it did not create, and nobody can say what a lead costs.",
      "We start with measurement. Analytics and conversion tracking are implemented and verified before campaigns scale, so when we report a result you can open the same dashboard and see it.",
    ],
    glyph: "marketing",
    problems: [
      {
        title: "You cannot tell which channel works",
        desc: "We implement clean event tracking and consistent UTM conventions, so attribution stops being an argument and becomes a lookup.",
      },
      {
        title: "Traffic arrives but does not convert",
        desc: "We examine intent against landing-page content and fix the mismatch — message, offer, form friction — before raising budget.",
      },
      {
        title: "Organic growth has flattened",
        desc: "Technical issues, thin content and weak internal linking are diagnosed separately, because they need different fixes.",
      },
      {
        title: "Ad spend scales but efficiency does not",
        desc: "We rebuild account structure around audiences and creative that actually differ, and test deliberately rather than continuously.",
      },
    ],
    capabilities: [
      {
        title: "SEO",
        desc: "Technical audits, crawlability and indexation, site architecture, on-page optimisation, content planning around search intent, and internal linking.",
      },
      {
        title: "Web analytics",
        desc: "GA4 and Tag Manager implementation, event and conversion modelling, consent handling, dashboard build, and verification that the numbers reconcile.",
      },
      {
        title: "Social media marketing",
        desc: "Channel strategy, content calendars, production workflow, community response patterns and performance review against stated goals.",
      },
      {
        title: "Meta Ads",
        desc: "Account structure, audience and creative testing, pixel and Conversions API setup, budget pacing and reporting tied to cost per qualified lead.",
      },
      {
        title: "Conversion rate optimisation",
        desc: "Landing-page diagnosis, form and funnel friction, A/B tests sized so the result means something.",
      },
      {
        title: "AI-assisted content production",
        desc: "Briefs, drafting and variant generation accelerated with AI, then edited and fact-checked by a person before anything is published.",
      },
    ],
    deliverables: [
      "Technical SEO audit with prioritised fix list",
      "GA4 and Tag Manager implementation, documented",
      "Conversion and event tracking plan, verified end to end",
      "Keyword and search-intent map tied to pages",
      "Content calendar with briefs",
      "Meta Ads account structure and creative test plan",
      "Reporting dashboard you own and can audit",
      "Monthly performance review with decisions, not just charts",
    ],
    tech: [
      "Google Analytics 4",
      "Google Tag Manager",
      "Google Search Console",
      "Google Ads",
      "Meta Ads Manager",
      "Meta Conversions API",
      "Looker Studio",
      "Schema.org",
      "Ahrefs / SEMrush",
    ],
    process: [
      { title: "Measurement audit", desc: "We verify what your current tracking actually records before trusting any historical number." },
      { title: "Baseline and targets", desc: "Current performance is documented per channel, and targets are agreed against it." },
      { title: "Technical and on-page fixes", desc: "Crawl, index, speed and content issues are cleared first — paid traffic should not land on broken pages." },
      { title: "Campaign and content execution", desc: "Content calendar and ad structure go live, with changes logged so cause and effect stay traceable." },
      { title: "Review and scale", desc: "Monthly review decides what gets more budget, what gets rebuilt and what stops." },
    ],
    tiers: [
      {
        name: "SEO & Analytics",
        price: "$499",
        period: "per month",
        desc: "Organic foundations plus correct measurement.",
        features: [
          "Full technical SEO audit",
          "GA4 and Tag Manager setup",
          "Keyword and intent research",
          "On-page optimisation",
          "Monthly performance report",
        ],
        cta: "Scope this tier",
      },
      {
        name: "Growth",
        price: "$1,499",
        period: "per month",
        desc: "SEO, Meta Ads and social running together.",
        features: [
          "Everything in SEO & Analytics",
          "Meta Ads management",
          "Social media marketing",
          "Content calendar and briefs",
          "A/B testing programme",
          "Bi-weekly review calls",
        ],
        highlighted: true,
        cta: "Most requested",
      },
      {
        name: "Scale",
        price: "$3,499",
        period: "per month",
        desc: "Full-funnel management with a dedicated strategist.",
        features: [
          "Everything in Growth",
          "Dedicated strategist",
          "Advanced analytics dashboard",
          "Retargeting and audience expansion",
          "Creative production pipeline",
          "Weekly strategy calls",
        ],
        cta: "Request a proposal",
      },
    ],
    pricingNote: "Management fees exclude ad spend, which is paid directly to the platform from your own account.",
    faqs: [
      {
        q: "Do you guarantee rankings or a specific ROAS?",
        a: "No, and you should be wary of anyone who does — neither search results nor auction costs are under our control. What we commit to is correct measurement, a documented plan, and honest reporting of what happened, including when something did not work.",
      },
      {
        q: "Who owns the ad accounts and analytics?",
        a: "You do. We work inside your Meta Business Manager, Google Ads and Analytics properties with delegated access. If we stop working together, nothing needs to be migrated and no data is lost.",
      },
      {
        q: "Why insist on fixing tracking before scaling spend?",
        a: "Because every optimisation decision depends on it. Scaling on numbers you cannot verify means scaling the wrong thing confidently. The audit usually takes days, not weeks.",
      },
      {
        q: "How long before SEO work shows results?",
        a: "Technical fixes can move impressions within weeks. Content and authority work usually takes three to six months to show in rankings, and we report leading indicators — crawl health, indexed pages, impressions, position changes — in the interim so progress is visible before revenue moves.",
      },
      {
        q: "Do you use AI to write content?",
        a: "We use AI for research, briefs, outlines and first drafts, which makes production faster and cheaper. Every published piece is edited and fact-checked by a person, and we tell you where AI was used. We do not publish unreviewed generated text.",
      },
    ],
    relatedWork: ["meta-ads-campaign", "seo-content-engine", "short-form-video-engine"],
    relatedSolutions: ["digital-growth", "intelligent-customer-support"],
    keywords: [
      "digital marketing services",
      "seo services",
      "meta ads agency",
      "google analytics 4 setup",
      "social media marketing services",
    ],
  },

  /* ──────────────────────────────────────────────────────── AI AGENTS ───── */
  {
    slug: "ai-agents",
    name: "Custom AI Agents",
    title: "Custom AI Agent Development",
    metaTitle: "Custom AI Agent Development — LLM Agents, RAG & Automation",
    metaDescription:
      "Hirelyx builds custom AI agents with defined scope, real tool access and evaluation before launch: support agents, document processing, lead qualification and multi-step workflow automation.",
    tagline: "Agents with a defined scope, real tools and a tested failure path.",
    summary:
      "Support agents, document processing, lead qualification and multi-step workflows — built on retrieval over your own content, with evaluation and escalation designed in.",
    intro: [
      "An agent is only useful when its boundaries are clear. What it may read, what it may do, what happens when it is unsure, and who it hands to. Skip that and you get a confident system that invents answers.",
      "We design the scope first, ground the agent in your own content through retrieval, give it a small set of real tools, and evaluate it against a test set of your actual questions before anyone outside the team uses it.",
    ],
    glyph: "ai-agent",
    problems: [
      {
        title: "The chatbot makes things up",
        desc: "We ground responses in retrieval over your approved content and have the agent say it does not know and escalate, rather than fill the gap.",
      },
      {
        title: "Support repeats the same answers",
        desc: "High-volume repetitive queries are handled automatically with a clean handover to a human for anything outside the defined scope.",
      },
      {
        title: "Documents are processed by hand",
        desc: "Invoices, applications, CVs and contracts are extracted into structured, validated data with low-confidence cases routed for review.",
      },
      {
        title: "You cannot tell whether it is working",
        desc: "We instrument every run — inputs, retrieved context, tool calls, cost and outcome — so quality is observable rather than anecdotal.",
      },
    ],
    capabilities: [
      {
        title: "Retrieval-grounded agents (RAG)",
        desc: "Ingestion and chunking of your documents, embeddings, vector search, reranking and citation of sources in answers.",
      },
      {
        title: "Tool-using agents",
        desc: "Typed tool definitions with validation and permission boundaries, so an agent can look things up and act without unbounded access.",
      },
      {
        title: "Customer support automation",
        desc: "Website, in-app and messaging channels, with intent routing, confidence thresholds and human escalation paths.",
      },
      {
        title: "Document and data processing",
        desc: "Extraction into Pydantic-validated schemas, confidence scoring and review queues for anything uncertain.",
      },
      {
        title: "Multi-step workflow agents",
        desc: "Pipelines that plan, call tools, verify intermediate results and retry — with hard stops instead of infinite loops.",
      },
      {
        title: "Evaluation and monitoring",
        desc: "A graded test set built from your real questions, regression runs on every prompt or model change, and cost and latency dashboards.",
      },
    ],
    deliverables: [
      "Scope document: what the agent does, and explicitly does not",
      "Retrieval pipeline over your content, with refresh routine",
      "Typed tool definitions with permission boundaries",
      "Evaluation set and graded baseline results",
      "Escalation and human-handover flow",
      "Monitoring dashboard: cost, latency, resolution, fallbacks",
      "Deployment into your channels and infrastructure",
      "Prompt and configuration documentation your team can edit",
    ],
    tech: [
      "Python",
      "OpenAI API",
      "Anthropic Claude API",
      "LangChain",
      "FastAPI",
      "Pydantic",
      "Vector databases",
      "n8n",
      "Supabase",
      "Model Context Protocol",
      "Redis",
    ],
    process: [
      { title: "Scope and boundary definition", desc: "We write down the questions and actions in scope, the ones out of scope, and the escalation rule." },
      { title: "Knowledge and tool mapping", desc: "Which sources the agent reads, how they stay fresh, and which systems it is allowed to touch." },
      { title: "Build and ground", desc: "Retrieval pipeline, prompts, tool layer and guardrails, developed against real examples." },
      { title: "Evaluate before launch", desc: "Graded runs against your test set; we publish accuracy and failure modes rather than a demo." },
      { title: "Launch, monitor, tune", desc: "Staged rollout with monitoring, then tuning based on logged real conversations." },
    ],
    tiers: [
      {
        name: "Chatbot",
        price: "$799",
        period: "per agent",
        desc: "A grounded assistant for one channel and knowledge base.",
        features: [
          "Retrieval over your content",
          "Website or WhatsApp integration",
          "Escalation to a human",
          "Conversation analytics",
          "1 month support",
        ],
        cta: "Scope this tier",
      },
      {
        name: "Workflow Agent",
        price: "$2,499",
        period: "per project",
        desc: "An agent that acts across your systems, not just answers.",
        features: [
          "Process analysis and scope document",
          "Multi-step agent pipeline",
          "Typed tool and API integrations",
          "Error handling and retry policy",
          "Evaluation set and baseline report",
          "3 months support and team training",
        ],
        highlighted: true,
        cta: "Most requested",
      },
      {
        name: "Enterprise AI",
        price: "Custom",
        period: "quote",
        desc: "Multiple agents, shared infrastructure, ongoing evaluation.",
        features: [
          "Multiple coordinated agents",
          "Shared retrieval and tool layer",
          "Real-time and batch processing",
          "Monitoring, alerting and cost controls",
          "Ongoing evaluation and tuning",
          "Agreed support terms",
        ],
        cta: "Request a proposal",
      },
    ],
    faqs: [
      {
        q: "Will my data be used to train someone else's model?",
        a: "Not through us. We use the providers' API tiers, which do not train on submitted data by default, keep retrieval content in storage you control, and document exactly what is sent to which provider so you can review it against your own policy.",
      },
      {
        q: "How do you stop the agent from inventing answers?",
        a: "Three things, together: answers are grounded in retrieved content with citations; the prompt and tooling make 'I don't know, let me hand this over' a first-class outcome; and a graded evaluation set catches regressions before they reach users. We also report the measured failure rate rather than claiming there is not one.",
      },
      {
        q: "Which model do you use?",
        a: "Whichever fits the task, cost and latency budget — usually Claude or GPT-class models, sometimes a smaller model for classification steps. We keep the model behind an abstraction so switching is a configuration change, not a rebuild.",
      },
      {
        q: "What does it cost to run?",
        a: "Token and infrastructure costs are yours and depend on volume. We estimate them during scoping from the actual prompt and retrieval sizes, instrument real cost per conversation after launch, and will tell you when a cheaper model or a cache would do the same job.",
      },
      {
        q: "Can it integrate with the tools we already use?",
        a: "Usually yes — anything with an API. Common integrations are CRMs, helpdesks, databases, spreadsheets and messaging platforms, either directly or through n8n. Where an MCP server gives cleaner, reusable access, we will say so.",
      },
    ],
    relatedWork: ["ai-support-agent", "workflow-automation"],
    relatedSolutions: ["ai-powered-workflows", "intelligent-customer-support", "business-process-automation"],
    keywords: [
      "custom ai agent development",
      "rag development services",
      "llm application development",
      "ai chatbot development",
      "ai workflow automation",
    ],
  },

  /* ──────────────────────────────────────────────────── MCP SERVERS ────── */
  {
    slug: "mcp-server-development",
    name: "MCP Server Development",
    title: "Custom MCP Server Development",
    metaTitle: "Custom MCP Server Development — Model Context Protocol Services",
    metaDescription:
      "Hirelyx builds custom Model Context Protocol (MCP) servers: typed tools and resources that let AI assistants read and act on your systems safely, with auth, scoping and audit logging.",
    tagline: "Give AI assistants a safe, typed door into your systems.",
    summary:
      "Custom Model Context Protocol servers that expose your data and actions as typed tools — with authentication, scoped permissions and audit logging built in from the start.",
    intro: [
      "The Model Context Protocol is an open standard for connecting AI assistants to real systems. Instead of writing a bespoke integration for every assistant, you build one MCP server and any MCP-capable client can use it.",
      "The hard part is not the protocol. It is deciding exactly which tools and resources to expose, what each is allowed to touch, how errors come back, and how every call is recorded. That design work is most of what we do here.",
    ],
    glyph: "mcp",
    problems: [
      {
        title: "Every assistant needs its own integration",
        desc: "One MCP server replaces repeated per-client glue code, so adding a new assistant is configuration rather than another project.",
      },
      {
        title: "Giving an AI database access feels reckless",
        desc: "Tools expose specific, parameterised operations instead of raw access — scoped, validated, and rejected cleanly when the request is out of bounds.",
      },
      {
        title: "Internal knowledge is scattered",
        desc: "Documents, tickets, schemas and runbooks become addressable MCP resources, so an assistant reads current sources rather than a stale copy.",
      },
      {
        title: "Nobody can audit what the AI did",
        desc: "Every tool call is logged with its caller, arguments, result and duration, so actions are reviewable after the fact.",
      },
    ],
    capabilities: [
      {
        title: "MCP server design and build",
        desc: "Tools, resources and prompts modelled against your domain, implemented in Python or TypeScript over stdio or HTTP transports.",
      },
      {
        title: "Typed tool contracts",
        desc: "JSON Schema and Pydantic-validated inputs and outputs, with error responses an assistant can reason about instead of guessing at.",
      },
      {
        title: "Authentication and permission scoping",
        desc: "Per-client credentials, least-privilege scopes, read-versus-write separation and rate limits at the server boundary.",
      },
      {
        title: "System and data integration",
        desc: "Databases, internal APIs, document stores, SaaS platforms and file systems surfaced as safe, purposeful operations.",
      },
      {
        title: "Audit logging and observability",
        desc: "Structured logs of every call, latency and error metrics, and alerting on unusual patterns.",
      },
      {
        title: "Client wiring and rollout",
        desc: "Configuration for the assistants your team actually uses, plus documentation so other teams can connect safely.",
      },
    ],
    deliverables: [
      "MCP server in your repository, deployable on your infrastructure",
      "Tool and resource specification document",
      "JSON Schema / Pydantic contracts for every tool",
      "Authentication, scoping and rate-limit configuration",
      "Audit logging with a documented retention approach",
      "Automated test suite covering tool contracts",
      "Client configuration for your assistants",
      "Operations runbook and handover session",
    ],
    tech: [
      "Model Context Protocol",
      "Python",
      "TypeScript",
      "FastAPI",
      "Pydantic",
      "JSON Schema",
      "PostgreSQL",
      "Docker",
      "OAuth 2.0",
      "OpenAPI",
    ],
    process: [
      { title: "Capability mapping", desc: "We list the questions and actions assistants need, then decide which become tools and which become resources." },
      { title: "Contract design", desc: "Input and output schemas, error taxonomy and permission scopes are written and reviewed before implementation." },
      { title: "Implementation", desc: "Server, adapters and validation built with tests against each tool contract." },
      { title: "Security review", desc: "Scope boundaries, injection surfaces, secret handling and audit coverage are checked explicitly." },
      { title: "Rollout and documentation", desc: "Deployment, client configuration, runbook and a walkthrough for the teams who will depend on it." },
    ],
    engagements: [
      {
        title: "Discovery sprint",
        desc: "A short, fixed-scope engagement that produces the capability map, tool contracts and a security review of what you are about to expose — useful on its own, and reusable whoever builds it.",
      },
      {
        title: "Single-server build",
        desc: "One MCP server over one system or domain: tools, resources, auth, tests, audit logging, deployment and handover.",
      },
      {
        title: "Platform engagement",
        desc: "Multiple servers over several systems with a shared auth and logging layer, plus an ongoing arrangement for new tools as your assistants take on more work.",
      },
    ],
    pricingNote:
      "MCP work is quoted per engagement rather than from a price list — scope depends entirely on how many systems are exposed and what each is allowed to do. Discovery produces a fixed written quote before any build begins.",
    faqs: [
      {
        q: "What is MCP, in one paragraph?",
        a: "The Model Context Protocol is an open standard that lets AI assistants connect to external systems through a uniform interface. A server advertises tools (actions the assistant can call) and resources (content it can read); any MCP-capable client can then use them. It replaces one-off integrations with a single contract.",
      },
      {
        q: "Is this safe to point at production systems?",
        a: "It is as safe as the tools you expose, which is why contract design comes before code. We default to read-only, require explicit justification for every write operation, scope credentials per client, validate all input, and log every call. We also tell you plainly which tools carry risk.",
      },
      {
        q: "Which assistants can use it?",
        a: "Any MCP-capable client. We configure the ones your team actually uses and document the connection steps so another team can add a client later without our involvement.",
      },
      {
        q: "Should I build an MCP server or a normal API?",
        a: "If the consumer is an AI assistant and you expect more than one, MCP usually wins — the tool descriptions and schemas are what the model needs to use it correctly. If the consumer is your own frontend, a normal API is simpler. We will say which applies to your case in discovery, including when the answer is 'you do not need this yet'.",
      },
      {
        q: "Why is there no price list for this?",
        a: "Because scope varies more than any other service we offer. One server over one read-only database is a small job; six servers with write access across finance systems is not. Discovery is short, fixed-scope, and produces a written quote.",
      },
    ],
    relatedWork: ["mcp-server-integration", "workflow-automation"],
    relatedSolutions: ["ai-powered-workflows", "custom-software", "business-process-automation"],
    keywords: [
      "mcp server development",
      "model context protocol development",
      "custom mcp server",
      "ai tool integration",
      "mcp consulting",
    ],
  },

  /* ────────────────────────────────────────────── PROMPT ENGINEERING ───── */
  {
    slug: "prompt-engineering",
    name: "Prompt Engineering",
    title: "Prompt Engineering Services",
    metaTitle: "Prompt Engineering Services — System Prompts, Evals & Tuning",
    metaDescription:
      "Prompt engineering from Hirelyx: system prompt design, structured output contracts, evaluation sets and measured iteration for Claude, GPT and other LLMs.",
    tagline: "Prompts designed against a test set, not a vibe.",
    summary:
      "System prompt architecture, structured output contracts and graded evaluation sets — so a prompt change is a measured improvement rather than a hopeful edit.",
    intro: [
      "Prompt work goes wrong in a predictable way. Someone edits the prompt, the one example they check looks better, it ships, and three other things quietly break.",
      "We treat prompts as versioned artefacts with tests. First an evaluation set from your real inputs and a graded baseline; then changes measured against it. You end up knowing not just that output improved, but by how much and where it still fails.",
    ],
    glyph: "prompt",
    problems: [
      {
        title: "Output quality is inconsistent",
        desc: "We find which part of the instruction is ambiguous, tighten the contract, and verify the fix across a whole test set instead of one example.",
      },
      {
        title: "Responses do not parse reliably",
        desc: "Structured output with a schema and validation turns 'usually JSON' into a contract your code can depend on.",
      },
      {
        title: "Changes break things you did not test",
        desc: "A graded evaluation set makes regressions visible before release, so iteration stops being a gamble.",
      },
      {
        title: "Costs are higher than they need to be",
        desc: "Shorter prompts, caching, and routing easy cases to a smaller model usually cut cost substantially with no quality loss.",
      },
    ],
    capabilities: [
      {
        title: "System prompt architecture",
        desc: "Role, constraints, output contract, refusal and uncertainty behaviour, and examples chosen to teach the edges rather than the obvious.",
      },
      {
        title: "Structured output design",
        desc: "Schemas, tool-call formats and validation so downstream code gets predictable data instead of prose it has to parse.",
      },
      {
        title: "Evaluation sets and grading",
        desc: "Representative cases drawn from your real inputs, with explicit grading criteria and a recorded baseline.",
      },
      {
        title: "Retrieval prompt tuning",
        desc: "Context assembly, chunk ordering, citation behaviour and the 'not in the provided context' rule for RAG systems.",
      },
      {
        title: "Cost and latency optimisation",
        desc: "Prompt compression, caching strategy and model routing, measured against the same evaluation set.",
      },
      {
        title: "Team enablement",
        desc: "A prompt library with usage notes, a change process, and a working session so your team can maintain it.",
      },
    ],
    deliverables: [
      "Documented system prompts, versioned",
      "Prompt library organised by use case",
      "Output schemas with validation rules",
      "Evaluation set with grading criteria",
      "Baseline and post-change comparison report",
      "Cost and latency analysis",
      "Change process your team can follow",
      "Training session and written guidance",
    ],
    tech: [
      "Anthropic Claude",
      "OpenAI GPT",
      "Google Gemini",
      "LangChain",
      "Pydantic",
      "JSON Schema",
      "Python",
      "Retrieval-augmented generation",
    ],
    process: [
      { title: "Use-case definition", desc: "What the model must do, what good output looks like, and what must never happen." },
      { title: "Evaluation set construction", desc: "Real inputs including the awkward ones, with grading criteria agreed up front." },
      { title: "Baseline measurement", desc: "Current prompts graded, so improvement is measured from a known starting point." },
      { title: "Iterate against the set", desc: "Changes made one variable at a time, with results recorded per change." },
      { title: "Document and hand over", desc: "Final prompts, evaluation harness, cost analysis and a working session with your team." },
    ],
    tiers: [
      {
        name: "Starter",
        price: "$299",
        period: "per project",
        desc: "One use case, properly tested.",
        features: [
          "Up to 5 optimised prompts",
          "Evaluation set for the use case",
          "Baseline and after comparison",
          "Written documentation",
          "1 revision round",
        ],
        cta: "Scope this tier",
      },
      {
        name: "Professional",
        price: "$799",
        period: "per project",
        desc: "A prompt system across several use cases.",
        features: [
          "20+ prompts across use cases",
          "System prompt architecture",
          "Structured output contracts",
          "Reasoning and multi-step tuning",
          "Team training session",
          "3 revision rounds",
        ],
        highlighted: true,
        cta: "Most requested",
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "quote",
        desc: "Ongoing prompt engineering alongside your team.",
        features: [
          "Unlimited prompts in scope",
          "Retrieval and tool-use optimisation",
          "Continuous evaluation harness",
          "Fine-tuning guidance where it helps",
          "Monthly review cycle",
          "Dedicated specialist",
        ],
        cta: "Request a proposal",
      },
    ],
    faqs: [
      {
        q: "Is prompt engineering still worth paying for as models improve?",
        a: "The easy wins have moved, but the valuable part was never clever phrasing. It is specifying the task precisely, defining the output contract, and having an evaluation set that tells you whether a change helped. Better models make that work pay off faster, not less.",
      },
      {
        q: "What does the evaluation set consist of?",
        a: "Your real inputs — including the awkward and ambiguous ones — with agreed grading criteria. Typically 30 to 100 cases depending on the task. It is yours to keep and extend, and it is the most durable thing we hand over.",
      },
      {
        q: "Can you cut our API costs?",
        a: "Usually, yes. Shorter prompts, prompt caching, and routing simple cases to a smaller model are the common levers. We measure cost per case before and after against the same evaluation set, so a saving is never bought with silent quality loss.",
      },
      {
        q: "Do we need fine-tuning instead?",
        a: "Rarely as a first step. Prompting and retrieval solve most problems faster and cheaper, and remain easier to change. When fine-tuning genuinely is the answer — a narrow, high-volume, stable task — we will say so and explain the data you would need.",
      },
      {
        q: "Will this work if we switch models later?",
        a: "Partly. Structure, contracts and the evaluation set transfer; specific phrasing sometimes needs retuning. Because you keep the evaluation harness, re-validating against a new model is a short exercise rather than a rebuild.",
      },
    ],
    relatedWork: ["prompt-library", "ai-support-agent"],
    relatedSolutions: ["ai-powered-workflows", "intelligent-customer-support"],
    keywords: [
      "prompt engineering services",
      "system prompt design",
      "llm evaluation",
      "structured output llm",
      "claude prompt optimisation",
    ],
  },
];

export const SERVICE_SLUGS = SERVICES.map((service) => service.slug);

const SERVICE_INDEX = new Map(SERVICES.map((service) => [service.slug, service]));

export function getService(slug: string): Service | undefined {
  return SERVICE_INDEX.get(slug);
}

export function servicesBySlug(slugs: readonly string[]): Service[] {
  return slugs.map((slug) => SERVICE_INDEX.get(slug)).filter((s): s is Service => Boolean(s));
}
