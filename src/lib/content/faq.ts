/* ==========================================================================
   HIRELYX · SITE FAQ
   --------------------------------------------------------------------------
   Carried over from the previous /faq page. Two answers were corrected
   rather than copied: the service list now names the six current service
   lines, and the project-stage answer reflects the seven-stage delivery
   process on /how-it-works instead of the superseded five-stage version.
   ========================================================================== */

export interface SiteFaq {
  category: string;
  q: string;
  a: string;
}

export const SITE_FAQS: SiteFaq[] = [
  {
    category: "General",
    q: "What services does Hirelyx offer?",
    a: "Six service lines: Python development, WordPress development, digital marketing, custom AI agents, MCP server development and prompt engineering. Anything outside those we will tell you we do not do, rather than stretch to fit.",
  },
  {
    category: "General",
    q: "How do I get started?",
    a: "Either send a project request through the contact form — four short steps — or book a free consultation on the bookings page. Both reach the same people; the form is faster if you already know roughly what you need.",
  },
  {
    category: "General",
    q: "Do you offer free consultations?",
    a: "Yes. The first call is free and is a scoping conversation rather than a pitch. Book a slot on the bookings page and we will come to it having read whatever you have sent us.",
  },
  {
    category: "Projects",
    q: "How can I track my project progress?",
    a: "Once a project starts you get an account in the client portal, where project status, milestones, files, messages and invoices all live. Access is enforced server-side, so you only ever see your own work.",
  },
  {
    category: "Projects",
    q: "What are the project stages?",
    a: "Seven: discovery, strategy, design, development, testing, launch and support. Each one has a defined output — a scope document, a quote, designs or technical contracts, working increments, test results, a live system, and documentation plus a handover session.",
  },
  {
    category: "Projects",
    q: "Can I communicate with the team during the project?",
    a: "Yes, and with the people actually doing the work rather than an account manager. Use the portal messages, the chat widget on any page, or email support@hirelyx.com.",
  },
  {
    category: "Payments",
    q: "How does pricing work?",
    a: "Each service page lists its current tiers so you can see the shape of it before talking to us. After discovery you get a fixed written quote with line items; approve it and it becomes an invoice in the portal. Larger projects are split across milestones.",
  },
  {
    category: "Payments",
    q: "What payment methods do you accept?",
    a: "Card payments through Stripe, invoiced from the client portal. Bank transfer can be arranged for larger projects. We never see or store your card details.",
  },
  {
    category: "Payments",
    q: "Can I see my invoices online?",
    a: "Yes — quotes and invoices are in the portal under Invoices, with payment status and downloadable copies.",
  },
  {
    category: "Payments",
    q: "What is your refund policy?",
    a: "Billing is milestone-based. If a deliverable does not match the agreed scope we revise it at our cost. If you cancel, unused milestone payments are refunded; work already delivered is not. The full terms are in our Terms of Service.",
  },
  {
    category: "Technical",
    q: "What technologies do you work with?",
    a: "Python, FastAPI, Pydantic, Pytest and Django on the backend; Next.js, React and TypeScript on the front end; PostgreSQL and Supabase for data; Claude and OpenAI APIs, LangChain and the Model Context Protocol for AI work; n8n and Stripe for automation and payments; WordPress and WooCommerce for content sites. The expertise pages explain why we reach for each one.",
  },
  {
    category: "Technical",
    q: "Do you provide hosting and maintenance?",
    a: "We configure and harden hosting that you own — Vercel, AWS or your preferred platform — and can take on maintenance under an agreed support arrangement. We do not resell hosting, so our recommendation has no margin attached to it.",
  },
  {
    category: "Technical",
    q: "Can you build custom AI solutions?",
    a: "Yes, with a scope defined up front and an evaluation run before launch. Agents, retrieval over your own content, document processing and MCP servers are all core work. If AI is not the right answer for a step, we will say so.",
  },
  {
    category: "Technical",
    q: "Who owns the code and the accounts?",
    a: "You do, from the start. Repositories, infrastructure, domains and third-party accounts are in your name, and nothing depends on Hirelyx at runtime.",
  },
  {
    category: "Booking",
    q: "How do I book a meeting?",
    a: "Go to the bookings page, pick an available date and time, add your details and confirm. You will get a confirmation email with the meeting details.",
  },
  {
    category: "Booking",
    q: "Can I reschedule or cancel a booking?",
    a: "Yes. Cancel from My Bookings in your dashboard. To reschedule, cancel the existing slot and book a new one.",
  },
];

export const FAQ_CATEGORIES: string[] = Array.from(
  new Set(SITE_FAQS.map((item) => item.category)),
);
