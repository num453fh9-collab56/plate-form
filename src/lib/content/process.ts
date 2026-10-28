import type { Step } from "./types";

/* ==========================================================================
   HIRELYX · DELIVERY PROCESS
   The seven stages every engagement runs through, with what the client
   actually receives at each one. Shared by the homepage and /how-it-works.
   ========================================================================== */

export interface DeliveryStage extends Step {
  /** Tangible output the client receives at this stage. */
  output: string;
}

export const DELIVERY_PROCESS: DeliveryStage[] = [
  {
    title: "Discovery",
    desc: "We learn how the business actually works — the process, the constraints, the systems already in place, and what has been tried before. Mostly listening and asking awkward questions.",
    output: "A written problem statement and a list of what we do not yet know",
  },
  {
    title: "Strategy",
    desc: "Scope, sequence and trade-offs get decided and written down: what is in, what is deliberately out, what it costs and roughly how long it takes.",
    output: "Fixed written scope, quote and milestone plan",
  },
  {
    title: "Design",
    desc: "For interfaces, the layouts and states. For systems, the data model, API contracts and integration points. Either way, the structure is agreed before code gets expensive to change.",
    output: "Designs or technical contracts, reviewed and signed off",
  },
  {
    title: "Development",
    desc: "Built in vertical slices so each milestone is working software you can use, not a percentage. You see progress in the client portal and in demos, not in status reports.",
    output: "Working increments in your repository, demonstrated as they land",
  },
  {
    title: "Testing",
    desc: "Automated tests for behaviour, manual passes for the things tests miss, plus accessibility, responsive and performance checks. For AI work, a graded evaluation run.",
    output: "Test results, coverage report and measured performance figures",
  },
  {
    title: "Launch",
    desc: "Deployment, environment configuration, redirects where URLs change, monitoring switched on, and a post-launch verification pass before anyone declares it done.",
    output: "Live system, deployment runbook and verification checklist",
  },
  {
    title: "Support",
    desc: "A handover session with your team, documentation they can act on, and an agreed support arrangement — so the system stays maintainable with or without us.",
    output: "Documentation, handover session and an agreed support window",
  },
];

/** Why clients choose Hirelyx — claims that can be checked against the work. */
export const WHY_HIRELYX: Step[] = [
  {
    title: "Specialists, not generalists",
    desc: "Six service lines, deliberately. Python and FastAPI engineering, AI agents, MCP servers, prompt engineering, WordPress and digital marketing — not a list of everything.",
  },
  {
    title: "Scope and price in writing first",
    desc: "Nothing starts on a verbal estimate. You get a written scope, a fixed quote and a milestone plan, and we say plainly what is excluded.",
  },
  {
    title: "You own everything",
    desc: "Code, infrastructure, accounts, documentation and tests are delivered in your name. There is no proprietary layer and no runtime dependency on us.",
  },
  {
    title: "Measured, not asserted",
    desc: "Performance work comes with before-and-after numbers. AI work comes with graded evaluation results. Marketing comes with tracking you can audit yourself.",
  },
  {
    title: "Secure by default",
    desc: "Access control enforced server-side, secrets kept out of the client, payments handled by Stripe, and security headers and rate limits configured rather than assumed.",
  },
  {
    title: "Transparent collaboration",
    desc: "A client portal with project status, files, messages and invoices, plus direct access to the people doing the work rather than an account manager.",
  },
];
