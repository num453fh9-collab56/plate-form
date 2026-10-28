import type { Solution } from "./types";

/* ==========================================================================
   HIRELYX · SOLUTIONS
   --------------------------------------------------------------------------
   Solutions are framed around the problem a client arrives with, and are
   delivered by one or more of the six services. Every `services` entry must
   be a real slug from `services.ts` — the page links straight through.
   ========================================================================== */

export const SOLUTIONS: Solution[] = [
  {
    slug: "business-process-automation",
    name: "Business Process Automation",
    title: "Business Process Automation",
    metaTitle: "Business Process Automation — Connect Systems, Remove Manual Work",
    metaDescription:
      "Hirelyx automates the manual steps between your systems: CRM sync, invoicing, onboarding, reporting and alerts, built on n8n, APIs and custom Python services.",
    tagline: "Stop paying people to move data between tabs.",
    summary:
      "The recurring manual steps between your tools — copying records, chasing approvals, rebuilding the same report — rebuilt as reliable automations with error handling and logs.",
    glyph: "automation",
    problem: [
      "Most teams do not have an automation problem. They have twelve small ones: a record that gets re-typed into a second system, a weekly report assembled by hand, an onboarding checklist that lives in someone's memory.",
      "Each is too small to prioritise, and together they consume a day a week. They also fail silently — nobody notices a skipped step until a customer does.",
    ],
    approach: [
      {
        title: "Map the process as it actually runs",
        desc: "Not the documented version. We sit with whoever does the work, record every step, system and exception, and count how long it takes.",
      },
      {
        title: "Automate the reliable middle first",
        desc: "The predictable majority of cases gets automated; genuine exceptions are routed to a person with the context already attached.",
      },
      {
        title: "Build for failure",
        desc: "Retries, idempotency, alerting and a readable run log — so a failed automation is visible and replayable rather than invisible.",
      },
      {
        title: "Hand over something your team can change",
        desc: "Workflows live in your own n8n instance or repository, documented, so a small change does not need us.",
      },
    ],
    outcomes: [
      "Recurring manual steps removed from the week",
      "One source of truth instead of re-typed records",
      "Failures that alert instead of passing unnoticed",
      "Processes documented as a by-product of automating them",
      "Workflows your team owns and can edit",
    ],
    services: ["ai-agents", "python-development", "mcp-server-development"],
    tech: ["n8n", "Python", "FastAPI", "Webhooks", "REST APIs", "PostgreSQL", "Supabase", "Zapier", "Make"],
    faqs: [
      {
        q: "We already use Zapier. Why would we change?",
        a: "Often you should not. Zapier is excellent for simple, low-volume connections. We move clients to n8n or custom services when per-task pricing gets expensive at volume, when logic outgrows linear steps, or when data cannot leave your own infrastructure.",
      },
      {
        q: "What happens when an automation breaks?",
        a: "It alerts, and the run log shows which step failed with what input. Steps are built to be idempotent where possible, so a replay does not duplicate work. We also agree up front which failures should stop the process and which should continue and flag.",
      },
      {
        q: "How do you decide what to automate first?",
        a: "Frequency times time saved, divided by implementation effort — with a bias towards the process whose failure costs the most. The map we produce in discovery makes that ranking obvious, and it is yours whether or not we build anything.",
      },
    ],
    keywords: ["business process automation", "n8n development", "workflow automation services", "api integration"],
  },
  {
    slug: "custom-software",
    name: "Custom Software",
    title: "Custom Software Development",
    metaTitle: "Custom Software Development — Internal Tools, APIs & Platforms",
    metaDescription:
      "Custom software from Hirelyx: internal tools, dashboards, APIs and platforms built with Python, FastAPI, Next.js and PostgreSQL — owned by you, documented, and tested.",
    tagline: "Built for how your business actually works.",
    summary:
      "Internal tools, dashboards, APIs and platforms for the parts of your business no off-the-shelf product fits — typed, tested and delivered in your own repository.",
    glyph: "software",
    problem: [
      "There is usually one process at the centre of a business that no product on the market quite handles. So it runs on a spreadsheet with twelve tabs, a shared inbox, and one person who understands it.",
      "That works until it does not: the spreadsheet corrupts, the person leaves, or the volume doubles. Custom software is worth building exactly there — and rarely anywhere else.",
    ],
    approach: [
      {
        title: "Model the domain before the screens",
        desc: "Entities, states and transitions first. Interfaces that match a wrong model are expensive to unwind later.",
      },
      {
        title: "Ship a thin slice end to end",
        desc: "One real workflow working completely, early, so the model is validated against reality rather than a document.",
      },
      {
        title: "Integrate rather than replace",
        desc: "Where you already have systems that work, we connect to them through typed clients instead of rebuilding them.",
      },
      {
        title: "Leave it maintainable",
        desc: "Tests, documentation, migrations and a CI pipeline — so the next change is routine, by us or by anyone.",
      },
    ],
    outcomes: [
      "A critical process off spreadsheets and into a real system",
      "A single data model instead of parallel versions",
      "Access control and an audit trail where they matter",
      "APIs your other tools can integrate with",
      "Code and infrastructure you own outright",
    ],
    services: ["python-development", "wordpress-development", "mcp-server-development"],
    tech: ["Python", "FastAPI", "Pydantic", "Pytest", "Next.js", "React", "TypeScript", "PostgreSQL", "Supabase", "Stripe", "Docker"],
    faqs: [
      {
        q: "Should we buy something instead of building?",
        a: "Usually, yes — and we will tell you when. Building is worth it when the process is a genuine differentiator, when integration cost across several SaaS tools exceeds the build, or when your constraints are unusual enough that configuration never quite fits.",
      },
      {
        q: "How do you handle changing requirements mid-build?",
        a: "Vertical slices make this manageable: because each slice is working software, re-prioritising the next one costs little. What we protect against is changing the data model late, which is why modelling comes first.",
      },
      {
        q: "What happens if we stop working with you?",
        a: "You keep everything: repository, infrastructure, accounts, documentation and tests. There is no runtime dependency on Hirelyx, no proprietary layer, and no licence to renew.",
      },
    ],
    keywords: ["custom software development", "internal tools development", "api development", "dashboard development"],
  },
  {
    slug: "ai-powered-workflows",
    name: "AI-Powered Workflows",
    title: "AI-Powered Workflows",
    metaTitle: "AI-Powered Workflows — Agents, Retrieval & MCP Integration",
    metaDescription:
      "Hirelyx puts AI where it measurably helps: triage, extraction, drafting and retrieval over your own content — grounded, evaluated, and wired into the systems you already run.",
    tagline: "AI in the specific places it earns its cost.",
    summary:
      "Triage, extraction, drafting and research steps handled by grounded AI inside your existing processes — scoped narrowly, evaluated honestly, and escalated to people by design.",
    glyph: "spark",
    problem: [
      "The question is rarely whether AI can do a task. It is whether it can do it reliably enough, cheaply enough, and with a sensible answer when it cannot.",
      "Projects fail when AI is dropped across a whole process instead of the two or three steps where judgement is cheap to verify and the cost of being wrong is contained.",
    ],
    approach: [
      {
        title: "Find the steps worth automating",
        desc: "We walk the process and identify where output is easy to verify and failure is recoverable. Those steps go first; the rest stay human.",
      },
      {
        title: "Ground it in your own content",
        desc: "Retrieval over your documents and data, with citations, so answers come from your material rather than the model's general training.",
      },
      {
        title: "Evaluate before rollout",
        desc: "A graded test set from your real cases, with accuracy and failure modes published to you before anyone depends on it.",
      },
      {
        title: "Keep a person in the loop where it counts",
        desc: "Confidence thresholds, review queues and clean escalation — so uncertainty becomes a handover rather than a confident error.",
      },
    ],
    outcomes: [
      "Repetitive judgement steps handled automatically",
      "Answers grounded in your content, with sources",
      "A measured accuracy baseline instead of an impression",
      "Cost per task visible and controllable",
      "Clear escalation when the system is unsure",
    ],
    services: ["ai-agents", "prompt-engineering", "mcp-server-development", "python-development"],
    tech: ["OpenAI API", "Anthropic Claude API", "LangChain", "Model Context Protocol", "Python", "FastAPI", "Pydantic", "Vector databases", "n8n"],
    faqs: [
      {
        q: "How do we know it is accurate enough to use?",
        a: "You see the numbers. We build an evaluation set from your real cases, grade the system against it, and report accuracy and failure modes before rollout. If it is not good enough for a step, we say so and that step stays manual.",
      },
      {
        q: "Will this replace jobs on our team?",
        a: "In the work we do, it usually removes the repetitive part of a role rather than the role. We will be straightforward about which tasks are affected during scoping, because planning for it works better than discovering it.",
      },
      {
        q: "Where does our data go?",
        a: "To the model providers you approve, through API tiers that do not train on submitted data by default, and nowhere else. Retrieval content stays in storage you control. We document exactly what is sent where so you can check it against your own policy.",
      },
    ],
    keywords: ["ai workflow automation", "ai integration services", "rag implementation", "llm automation"],
  },
  {
    slug: "digital-growth",
    name: "Digital Growth",
    title: "Digital Growth",
    metaTitle: "Digital Growth — SEO, Paid Social & Conversion, Measured Properly",
    metaDescription:
      "Hirelyx builds digital growth on verified measurement: technical SEO, GA4 tracking, Meta Ads and conversion work, reported against cost per qualified lead.",
    tagline: "Growth you can audit line by line.",
    summary:
      "Organic and paid demand built on tracking that reconciles — technical SEO, content, Meta Ads and landing-page work, reported against cost per qualified lead.",
    glyph: "growth",
    problem: [
      "Growth spend is unusually easy to misjudge, because the reporting is produced by the party being judged. Double-counted conversions and generous attribution windows make almost any channel look fine.",
      "The fix is boring and effective: implement measurement correctly, agree what counts as a qualified lead, and report against it even when the number is unflattering.",
    ],
    approach: [
      {
        title: "Verify measurement first",
        desc: "Analytics and conversion tracking are audited and rebuilt where needed before any budget decision rests on them.",
      },
      {
        title: "Fix the destination before buying traffic",
        desc: "Page speed, message match and form friction are addressed first. Paid clicks landing on a weak page are the most expensive way to learn that.",
      },
      {
        title: "Build organic and paid together",
        desc: "Search intent research informs both ad copy and content, and paid data shortens the organic learning cycle.",
      },
      {
        title: "Report in decisions, not charts",
        desc: "Each review names what gets more budget, what gets rebuilt and what stops — with the reasoning written down.",
      },
    ],
    outcomes: [
      "Conversion tracking you can verify yourself",
      "Cost per qualified lead by channel",
      "Technical SEO issues cleared and monitored",
      "A content plan tied to real search intent",
      "Ad structure that can scale without losing efficiency",
    ],
    services: ["digital-marketing", "wordpress-development"],
    tech: ["Google Analytics 4", "Google Tag Manager", "Google Search Console", "Meta Ads", "Meta Conversions API", "Looker Studio", "Schema.org"],
    faqs: [
      {
        q: "What is the minimum useful budget?",
        a: "For paid channels, enough to gather statistically meaningful data in a reasonable window — below that you are buying noise. We will tell you honestly if your budget is better spent entirely on SEO and conversion work for now.",
      },
      {
        q: "Do you require a long contract?",
        a: "No. Monthly retainers are month-to-month, because the work should justify itself continuously. Fixed-scope projects such as an SEO audit or analytics rebuild are quoted and delivered as one-off engagements.",
      },
      {
        q: "Can you work with our existing marketing team?",
        a: "Yes, and it is often the best arrangement — we take the technical layer (tracking, SEO, performance, ad structure) while your team owns brand and content. We document everything we set up so it stays usable after the engagement.",
      },
    ],
    keywords: ["digital growth agency", "seo and paid media", "conversion rate optimisation", "lead generation marketing"],
  },
  {
    slug: "intelligent-customer-support",
    name: "Intelligent Customer Support",
    title: "Intelligent Customer Support",
    metaTitle: "Intelligent Customer Support — Grounded AI Deflection & Escalation",
    metaDescription:
      "Hirelyx builds support automation that deflects repetitive questions using retrieval over your own help content, with confidence thresholds and clean escalation to your team.",
    tagline: "Answer the repetitive questions. Escalate the rest cleanly.",
    summary:
      "Support automation grounded in your own help content, with confidence thresholds, source citations and a handover that arrives with context already attached.",
    glyph: "support",
    problem: [
      "A large share of support volume is the same handful of questions, asked in different words. Answering them manually is slow for the customer and demoralising for the team.",
      "But a support bot that guesses is worse than no bot. The design problem is knowing the boundary — and handing over before it is crossed.",
    ],
    approach: [
      {
        title: "Analyse real tickets first",
        desc: "We cluster your actual conversation history to find what is genuinely repetitive and what needs a person. That defines the scope.",
      },
      {
        title: "Ground answers in approved content",
        desc: "Retrieval over your help centre, docs and policies, with citations, so answers are checkable and update when content does.",
      },
      {
        title: "Set the escalation rule explicitly",
        desc: "Confidence thresholds, out-of-scope intents and sentiment triggers decide when a human takes over — with transcript and context attached.",
      },
      {
        title: "Measure deflection and satisfaction together",
        desc: "Deflection alone can be achieved by frustrating people. We track resolution, escalation and fallback rates side by side.",
      },
    ],
    outcomes: [
      "Repetitive queries resolved without a queue",
      "Answers that cite the help content they came from",
      "Escalations that arrive with full context",
      "Visibility into what customers actually ask",
      "Coverage across web, in-app and messaging channels",
    ],
    services: ["ai-agents", "prompt-engineering", "digital-marketing"],
    tech: ["OpenAI API", "Anthropic Claude API", "Vector databases", "LangChain", "FastAPI", "Supabase", "n8n", "WhatsApp Business API"],
    faqs: [
      {
        q: "What deflection rate should we expect?",
        a: "It depends almost entirely on how repetitive your volume is and how good your help content is. We estimate it from your own ticket history during scoping rather than quoting an industry figure, and we report the measured rate after launch.",
      },
      {
        q: "Can customers always reach a human?",
        a: "Yes. We treat that as a requirement, not a setting. Escalation is always available on request, and is triggered automatically on low confidence, out-of-scope intents and frustration signals.",
      },
      {
        q: "What if our help content is out of date?",
        a: "Then that is the first piece of work, because retrieval cannot improve on its sources. We identify the gaps from your ticket clusters and tell you what to write — often a short list with disproportionate impact.",
      },
    ],
    keywords: ["ai customer support", "support automation", "customer service chatbot", "ticket deflection"],
  },
];

export const SOLUTION_SLUGS = SOLUTIONS.map((solution) => solution.slug);

const SOLUTION_INDEX = new Map(SOLUTIONS.map((solution) => [solution.slug, solution]));

export function getSolution(slug: string): Solution | undefined {
  return SOLUTION_INDEX.get(slug);
}

export function solutionsBySlug(slugs: readonly string[]): Solution[] {
  return slugs
    .map((slug) => SOLUTION_INDEX.get(slug))
    .filter((s): s is Solution => Boolean(s));
}
