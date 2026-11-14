import { EXPERTISE } from "./expertise";
import { SERVICES } from "./services";
import { SOLUTIONS } from "./solutions";
import type { ExpertiseArea, Service, Solution } from "./types";

/* ==========================================================================
   HIRELYX · DERIVED INTERNAL LINKS
   --------------------------------------------------------------------------
   The content records only ever point one way: a solution lists the services
   that deliver it, an expertise area lists the services it is applied in.
   These helpers read those same arrays backwards so a service page can link
   to its solutions and expertise areas without a second set of slug lists to
   keep in sync — the cross-links can never disagree with each other, because
   there is only one list.
   ========================================================================== */

/** Expertise areas whose `services` include this service. */
export function expertiseForService(serviceSlug: string): ExpertiseArea[] {
  return EXPERTISE.filter((area) => area.services.includes(serviceSlug));
}

/** Solutions whose `services` include this service. */
export function solutionsForService(serviceSlug: string): Solution[] {
  return SOLUTIONS.filter((solution) => solution.services.includes(serviceSlug));
}

/** Services that deliver this solution, in the order the solution lists them. */
export function servicesForSolution(solutionSlug: string): Service[] {
  const solution = SOLUTIONS.find((s) => s.slug === solutionSlug);
  if (!solution) return [];
  return solution.services
    .map((slug) => SERVICES.find((s) => s.slug === slug))
    .filter((s): s is Service => Boolean(s));
}

/**
 * Solutions reachable from an expertise area through a shared service, so
 * "React & Next.js" can point at "Custom Software" without either record
 * naming the other.
 */
export function solutionsForExpertise(areaSlug: string): Solution[] {
  const area = EXPERTISE.find((a) => a.slug === areaSlug);
  if (!area) return [];
  return SOLUTIONS.filter((solution) =>
    solution.services.some((slug) => area.services.includes(slug)),
  );
}
