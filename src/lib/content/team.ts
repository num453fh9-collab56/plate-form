/* ==========================================================================
   HIRELYX · TEAM
   --------------------------------------------------------------------------
   Carried over verbatim from the previous TeamSection component: names,
   roles, bios, stated experience, certifications, skills, photographs and
   links are unchanged. Only the presentation is new.

   Do not add a certification, a year of experience or a link that the person
   has not confirmed.
   ========================================================================== */

export interface TeamMember {
  name: string;
  role: string;
  badge: string;
  bio: string;
  skills: string[];
  certifications: string[];
  experience: string;
  initials: string;
  photo?: string;
  github?: string;
  linkedin?: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Saad Amjad",
    role: "Founder & Full-Stack Developer",
    badge: "Founder",
    bio: "Founded Hirelyx to deliver world-class digital products. Builds custom AI agents and automation workflows that eliminate manual work and supercharge businesses.",
    skills: ["Full-Stack Dev", "Custom AI Agents", "n8n", "LangChain", "Python", "Prompt Engineering"],
    certifications: ["OpenAI Developer", "n8n Expert"],
    experience: "3+ years",
    initials: "SA",
    photo: "/team-saad.png",
    github: "https://github.com/saadamjad44",
  },
  {
    name: "Nauman Ali",
    role: "Full-Stack Developer & UI/UX Designer",
    badge: "Frontend Lead",
    bio: "Crafts pixel-perfect interfaces and full-stack applications with React and Next.js. Specialises in responsive design, animation and user experience.",
    skills: ["Full-Stack Dev", "React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "UI/UX"],
    certifications: ["Google UX Design", "Meta Frontend Developer"],
    experience: "2+ years",
    initials: "NA",
    photo: "/team-nauman.jpeg",
    github: "https://github.com/num453fh9-collab56",
  },
  {
    name: "Hafiz Salman",
    role: "Full-Stack Developer & Digital Marketing",
    badge: "Marketing Lead",
    bio: "Full-stack developer who also drives growth through SEO, web analytics, social media marketing and Meta Ads campaigns that deliver measurable results.",
    skills: ["Full-Stack Dev", "SEO", "Meta Ads", "Google Analytics", "Social Media", "Content Strategy"],
    certifications: ["Google Ads Certified", "Meta Blueprint"],
    experience: "4+ years",
    initials: "HS",
  },
];

/** Every certification the team holds, de-duplicated — used on the trust section. */
export const TEAM_CERTIFICATIONS: string[] = Array.from(
  new Set(TEAM.flatMap((member) => member.certifications)),
);
