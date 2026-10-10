import { experienceKey } from "./skills-meta";
import type { Translate } from "./i18n";
import type { TranslationKey } from "./i18n";

/* ==========================================================================
   HIRELYX · BIO WRITER
   Length bands + simple quality checks for the profile bio, and three
   ready-to-edit templates composed from what the freelancer already entered
   (name, headline, top skills, experience). Everything runs locally — no AI
   call, so it is instant and works offline.
   ========================================================================== */

export const BIO_MIN = 40;
export const BIO_GOOD = 150;
export const BIO_RICH = 600;
export const BIO_MAX = 1500;

export type BioBand = "empty" | "short" | "ok" | "good" | "rich";

export function bioBand(length: number): BioBand {
  if (length === 0) return "empty";
  if (length < BIO_MIN) return "short";
  if (length < BIO_GOOD) return "ok";
  if (length < BIO_RICH) return "good";
  return "rich";
}

export interface BioCheck {
  key: string;
  labelKey: TranslationKey;
  done: boolean;
}

const CTA = /\b(contact|message|reach|hire|let'?s|get in touch|send|talk|chat|discuss|book)\b/i;
const NUMBER = /\d/;

export function bioChecks(bio: string, skills: string[]): BioCheck[] {
  const text = bio.trim();
  const lower = text.toLowerCase();
  return [
    { key: "length", labelKey: "bio.checkLength", done: text.length >= BIO_GOOD },
    {
      key: "skills",
      labelKey: "bio.checkSkills",
      done: skills.some((skill) => skill.length > 1 && lower.includes(skill.toLowerCase())),
    },
    { key: "numbers", labelKey: "bio.checkNumbers", done: NUMBER.test(text) },
    { key: "cta", labelKey: "bio.checkCta", done: CTA.test(text) },
    { key: "paragraphs", labelKey: "bio.checkParagraphs", done: /\n\s*\S/.test(text) },
  ];
}

export interface BioContext {
  fullName: string;
  headline: string;
  skills: string[];
  experienceYears: string;
  category: string;
}

export interface BioTemplate {
  id: "professional" | "friendly" | "results";
  labelKey: TranslationKey;
  text: string;
}

function listSkills(skills: string[]): string {
  const top = skills.slice(0, 3);
  if (top.length === 0) return "";
  if (top.length === 1) return top[0];
  return `${top.slice(0, -1).join(", ")} and ${top[top.length - 1]}`;
}

export function bioTemplates(context: BioContext, t: Translate): BioTemplate[] {
  const firstName = context.fullName.trim().split(/\s+/)[0] || "I";
  const role = context.headline.trim() || context.category || "freelance professional";
  const skills = listSkills(context.skills) || "my craft";
  const expKey = experienceKey(context.experienceYears);
  const experience = expKey ? t(expKey).toLowerCase() : "";
  const withExperience = experience ? ` with ${experience} of hands-on experience` : "";
  const intro = firstName === "I" ? "I'm a" : `I'm ${firstName}, a`;

  return [
    {
      id: "professional",
      labelKey: "bio.tplProfessional",
      text:
        `${intro} ${role}${withExperience}. I specialise in ${skills}, and I focus on clean, reliable work delivered on time.\n\n` +
        "Every project starts with a clear understanding of your goals, followed by regular updates so you always know where things stand. " +
        "I'm comfortable working independently or as part of your team.\n\n" +
        "Send me a message with your project details and I'll reply with a plan and timeline.",
    },
    {
      id: "friendly",
      labelKey: "bio.tplFriendly",
      text:
        `Hi! ${intro} ${role} who loves turning ideas into real results. My go-to skills are ${skills}${withExperience ? `, built up${withExperience.replace(" with", " over")}` : ""}.\n\n` +
        "I keep communication simple and friendly, ask the right questions early, and treat your project like my own.\n\n" +
        "Have something in mind? Let's chat — I'm happy to share ideas before you hire.",
    },
    {
      id: "results",
      labelKey: "bio.tplResults",
      text:
        `${role}${withExperience}, focused on measurable results.\n\n` +
        `• Core skills: ${skills}\n` +
        "• Clear milestones, fast responses and revisions until it's right\n" +
        "• Work that is documented and easy to maintain after hand-off\n\n" +
        "Tell me your goal and deadline — I'll show you exactly how I'd get there.",
    },
  ].map((template) => ({ ...template, text: template.text.slice(0, BIO_MAX) })) as BioTemplate[];
}
