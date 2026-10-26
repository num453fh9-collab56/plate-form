import type { MenuLink } from "./types";

/* ==========================================================================
   HIRELYX · NAVIGATION ARCHITECTURE
   --------------------------------------------------------------------------
   Single source of truth for the header mega menu, the mobile drawer and the
   footer link columns. Every href below must resolve to a real page or to an
   anchor that exists on the target page — there are no placeholder links in
   the navigation.
   ========================================================================== */

export interface NavGroup {
  id: string;
  title: string;
  links: MenuLink[];
}

export interface NavFeature {
  kicker: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** When present the item opens a mega panel instead of navigating on hover. */
  groups?: NavGroup[];
  feature?: NavFeature;
}

export const PRIMARY_NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/" },

  {
    id: "services",
    label: "Services",
    href: "/services",
    groups: [
      {
        id: "development",
        title: "Development",
        links: [
          { label: "Python Development", href: "/services/python-development", hint: "Backends, services and APIs" },
          { label: "WordPress Development", href: "/services/wordpress-development", hint: "Custom themes and WooCommerce" },
          { label: "All services", href: "/services", hint: "Compare the six service lines" },
        ],
      },
      {
        id: "python-capabilities",
        title: "Python Capabilities",
        links: [
          { label: "FastAPI", href: "/expertise/fastapi", hint: "Typed, async API services" },
          { label: "Pydantic", href: "/expertise/fastapi#pydantic-models", hint: "Validation at the boundary" },
          { label: "Pytest", href: "/expertise/fastapi#pytest-fixtures", hint: "Tests that mean something" },
          { label: "API Development", href: "/solutions/custom-software", hint: "REST, GraphQL and webhooks" },
        ],
      },
      {
        id: "ai-engineering",
        title: "AI Engineering",
        links: [
          { label: "Custom AI Agents", href: "/services/ai-agents", hint: "Scoped, grounded, evaluated" },
          { label: "MCP Server Development", href: "/services/mcp-server-development", hint: "Typed tools for AI clients" },
          { label: "Prompt Engineering", href: "/services/prompt-engineering", hint: "Measured, versioned prompts" },
          { label: "AI & LLM Expertise", href: "/expertise/ai-and-llms", hint: "How we engineer around models" },
        ],
      },
      {
        id: "digital-marketing",
        title: "Digital Marketing",
        links: [
          { label: "SEO", href: "/services/digital-marketing#capabilities", hint: "Technical, on-page and content" },
          { label: "Web Analytics", href: "/services/digital-marketing#capabilities", hint: "GA4 and conversion tracking" },
          { label: "Social Media Marketing", href: "/services/digital-marketing#capabilities", hint: "Strategy and production" },
          { label: "Meta Ads", href: "/services/digital-marketing#capabilities", hint: "Facebook and Instagram" },
        ],
      },
    ],
    feature: {
      kicker: "Not sure where to start?",
      title: "Tell us the problem, not the service",
      body: "Describe what is slowing you down and we will say which service fits — or that none of them do.",
      cta: { label: "Get a proposal", href: "/contact" },
    },
  },

  {
    id: "solutions",
    label: "Solutions",
    href: "/solutions",
    groups: [
      {
        id: "operations",
        title: "Operations & AI",
        links: [
          { label: "Business Process Automation", href: "/solutions/business-process-automation", hint: "Remove the manual middle" },
          { label: "AI-Powered Workflows", href: "/solutions/ai-powered-workflows", hint: "AI where it earns its cost" },
          { label: "Intelligent Customer Support", href: "/solutions/intelligent-customer-support", hint: "Deflect, then escalate cleanly" },
        ],
      },
      {
        id: "build-grow",
        title: "Build & Grow",
        links: [
          { label: "Custom Software", href: "/solutions/custom-software", hint: "Tools, APIs and platforms" },
          { label: "Digital Growth", href: "/solutions/digital-growth", hint: "Measured organic and paid" },
          { label: "All solutions", href: "/solutions", hint: "Problem-first overview" },
        ],
      },
    ],
    feature: {
      kicker: "Delivery",
      title: "Seven stages, nothing skipped",
      body: "Discovery, strategy, design, development, testing, launch and support — with what you receive at each stage written down.",
      cta: { label: "See our process", href: "/how-it-works" },
    },
  },

  {
    id: "expertise",
    label: "Expertise",
    href: "/expertise",
    groups: [
      {
        id: "specialisation",
        title: "Specialisation",
        links: [
          { label: "Backend Engineering", href: "/expertise/python", hint: "Services, workers, data" },
          { label: "AI & LLM Engineering", href: "/expertise/ai-and-llms", hint: "Retrieval, agents, evaluation" },
          { label: "Front-End Engineering", href: "/expertise/react-nextjs", hint: "Server-first React" },
          { label: "Automation & Integrations", href: "/expertise/automation-and-integrations", hint: "n8n, APIs, webhooks" },
        ],
      },
      {
        id: "tech-stack",
        title: "Tech Stack",
        links: [
          { label: "Python", href: "/expertise/python", hint: "FastAPI, Django, Celery" },
          { label: "FastAPI, Pydantic & Pytest", href: "/expertise/fastapi", hint: "Typed, tested APIs" },
          { label: "React & Next.js", href: "/expertise/react-nextjs", hint: "App Router, TypeScript" },
          { label: "OpenAI & Claude APIs", href: "/expertise/ai-and-llms#stack", hint: "Model layer and tooling" },
          { label: "LangChain & MCP", href: "/expertise/ai-and-llms#stack", hint: "Orchestration and tool access" },
          { label: "n8n & Webhooks", href: "/expertise/automation-and-integrations", hint: "Connective tissue" },
        ],
      },
      {
        id: "industries",
        title: "Industries",
        links: [
          { label: "SaaS & Startups", href: "/expertise#industries" },
          { label: "Professional Services", href: "/expertise#industries" },
          { label: "E-commerce & Retail", href: "/expertise#industries" },
          { label: "Education & Training", href: "/expertise#industries" },
          { label: "Operations-Heavy Businesses", href: "/expertise#industries" },
          { label: "Content & Media", href: "/expertise#industries" },
        ],
      },
    ],
    feature: {
      kicker: "Technology choices",
      title: "We write down why, not just what",
      body: "Every stack decision comes with the reasoning and the trade-off, so the next team can agree or change it knowingly.",
      cta: { label: "Explore expertise", href: "/expertise" },
    },
  },

  { id: "portfolio", label: "Portfolio", href: "/portfolio" },
  { id: "about", label: "About Us", href: "/about" },
  { id: "insights", label: "Insights", href: "/blog" },
  { id: "contact", label: "Contact", href: "/contact" },
];

/* ───────────────────────────────────────────────────────────── FOOTER ──── */

export interface FooterColumnDef {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_NAV: FooterColumnDef[] = [
  {
    id: "services",
    title: "Services",
    links: [
      { label: "Python Development", href: "/services/python-development" },
      { label: "WordPress Development", href: "/services/wordpress-development" },
      { label: "Digital Marketing", href: "/services/digital-marketing" },
      { label: "Custom AI Agents", href: "/services/ai-agents" },
      { label: "MCP Server Development", href: "/services/mcp-server-development" },
      { label: "Prompt Engineering", href: "/services/prompt-engineering" },
    ],
  },
  {
    id: "solutions",
    title: "Solutions",
    links: [
      { label: "Business Process Automation", href: "/solutions/business-process-automation" },
      { label: "Custom Software", href: "/solutions/custom-software" },
      { label: "AI-Powered Workflows", href: "/solutions/ai-powered-workflows" },
      { label: "Digital Growth", href: "/solutions/digital-growth" },
      { label: "Intelligent Customer Support", href: "/solutions/intelligent-customer-support" },
    ],
  },
  {
    id: "expertise",
    title: "Expertise",
    links: [
      { label: "Python", href: "/expertise/python" },
      { label: "FastAPI, Pydantic & Pytest", href: "/expertise/fastapi" },
      { label: "React & Next.js", href: "/expertise/react-nextjs" },
      { label: "AI & LLM Engineering", href: "/expertise/ai-and-llms" },
      { label: "Automation & Integrations", href: "/expertise/automation-and-integrations" },
      { label: "Industries we work with", href: "/expertise#industries" },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Process", href: "/how-it-works" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Insights", href: "/blog" },
      { label: "Reviews", href: "/reviews" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "client",
    title: "For Clients",
    links: [
      { label: "Client Portal", href: "/portal" },
      { label: "Book a Consultation", href: "/bookings" },
      { label: "Invoices", href: "/invoices" },
      { label: "Help Centre", href: "/help" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export const LEGAL_NAV = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
];

export const CONTACT_DETAILS = {
  email: "support@hirelyx.com",
  responseTime: "Within 24–48 hours",
  consultation: "/bookings",
};
