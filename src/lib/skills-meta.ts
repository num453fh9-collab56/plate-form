import type { TranslationKey } from "./i18n";
import type { SkillLevel } from "./types";

/* ==========================================================================
   HIRELYX · SKILLS STEP REFERENCE DATA
   Option lists for the skills & availability step. Stored values are stable
   English slugs/labels; the UI always renders through translation keys.
   ========================================================================== */

export const MAX_SKILLS = 15;
export const MIN_SKILLS = 3;
export const TOP_SKILLS = 3;

export const SKILL_LEVELS: { value: SkillLevel; key: TranslationKey }[] = [
  { value: "Beginner", key: "skills.levelBeginner" },
  { value: "Intermediate", key: "skills.levelIntermediate" },
  { value: "Expert", key: "skills.levelExpert" },
];

export const DEFAULT_SKILL_LEVEL: SkillLevel = "Intermediate";

export function levelFor(levels: Record<string, SkillLevel>, skill: string): SkillLevel {
  return levels[skill] ?? DEFAULT_SKILL_LEVEL;
}

/* Stored as the bucket's lower bound in years (profiles.experience_years). */
export const EXPERIENCE_OPTIONS: { value: string; key: TranslationKey }[] = [
  { value: "0", key: "skills.exp0" },
  { value: "1", key: "skills.exp1" },
  { value: "3", key: "skills.exp3" },
  { value: "6", key: "skills.exp6" },
  { value: "10", key: "skills.exp10" },
];

export function experienceKey(value: string): TranslationKey | undefined {
  return EXPERIENCE_OPTIONS.find((option) => option.value === value)?.key;
}

/* Values match what was already stored in profiles.availability. */
export const AVAILABILITY_OPTIONS: {
  value: string;
  key: TranslationKey;
  subKey: TranslationKey;
  tone: "blue" | "green" | "amber" | "grey";
}[] = [
  { value: "Full time", key: "profile.availFull", subKey: "avail.fullSub", tone: "green" },
  { value: "Part time", key: "profile.availPart", subKey: "avail.partSub", tone: "blue" },
  { value: "Project based", key: "profile.availProject", subKey: "avail.projectSub", tone: "amber" },
  { value: "Not available right now", key: "profile.availNot", subKey: "avail.notSub", tone: "grey" },
];

export function availabilityKey(value: string): TranslationKey | undefined {
  return AVAILABILITY_OPTIONS.find((option) => option.value === value)?.key;
}

export const WEEKLY_HOURS: { value: string; key: TranslationKey }[] = [
  { value: "lt10", key: "avail.hoursLt10" },
  { value: "10-20", key: "avail.hours10" },
  { value: "20-30", key: "avail.hours20" },
  { value: "30-40", key: "avail.hours30" },
  { value: "40plus", key: "avail.hours40" },
];

export const RESPONSE_TIMES: { value: string; key: TranslationKey }[] = [
  { value: "within-hour", key: "avail.respHour" },
  { value: "within-hours", key: "avail.respHours" },
  { value: "within-day", key: "avail.respDay" },
  { value: "few-days", key: "avail.respDays" },
];

export function responseKey(value: string): TranslationKey | undefined {
  return RESPONSE_TIMES.find((option) => option.value === value)?.key;
}
