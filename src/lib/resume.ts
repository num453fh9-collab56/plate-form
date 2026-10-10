/* ==========================================================================
   HIRELYX · RESUME ENGINE
   Real client-side resume parsing — no server, no API key:
     PDF   → text via pdfjs-dist
     DOCX  → text via mammoth
     TXT/MD/RTF → File.text()
   The extracted text is then analysed with weighted keyword scoring to detect
   category, seniority, contact details and skills, and a varied bio draft is
   composed from the findings.
   ========================================================================== */

export interface ResumeAnalysis {
  fullName: string;
  phone: string;
  category: string;
  headline: string;
  skills: string[];
  years: number;
}

/* ------------------------------ text extraction ------------------------------ */

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (/\.(txt|md|rtf)$/.test(name)) return file.text();
  if (name.endsWith(".pdf")) return extractPdfText(file);
  if (name.endsWith(".docx")) return extractDocxText(file);
  return "";
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  try {
    const chunks: string[] = [];
    const pages = Math.min(doc.numPages, 20);
    for (let pageNo = 1; pageNo <= pages; pageNo += 1) {
      const page = await doc.getPage(pageNo);
      const content = await page.getTextContent();
      chunks.push(
        content.items.map((item) => ("str" in item ? item.str : "")).join(" "),
      );
    }
    return chunks.join("\n");
  } finally {
    void loadingTask.destroy();
  }
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/* ------------------------------ analysis ------------------------------ */

interface CategoryHint {
  category: string;
  headline: string;
  keywords: string[];
  skills: string[];
}

const CATEGORY_HINTS: CategoryHint[] = [
  {
    category: "Web Development",
    headline: "Full-Stack Web Developer",
    keywords: ["react", "next", "node", "typescript", "javascript", "frontend", "front-end", "backend", "back-end", "full stack", "full-stack", "api", "html", "css", "vue", "angular", "wordpress", "php", "laravel", "web developer", "software engineer"],
    skills: ["React", "Next.js", "TypeScript", "Node.js", "REST APIs", "Tailwind CSS"],
  },
  {
    category: "UI/UX Design",
    headline: "Product UI/UX Designer",
    keywords: ["figma", "ui/ux", "ui ", "ux ", "user experience", "user interface", "wireframe", "prototype", "adobe xd", "sketch", "branding", "logo", "illustration", "design system"],
    skills: ["Figma", "Wireframing", "Prototyping", "Design Systems", "User Research", "Brand Identity"],
  },
  {
    category: "Digital Marketing",
    headline: "Digital Marketing Strategist",
    keywords: ["seo", "marketing", "ads", "ppc", "social media", "content marketing", "email marketing", "analytics", "growth", "sem", "campaign", "conversion"],
    skills: ["SEO", "Google Ads", "Meta Ads", "Content Strategy", "Email Marketing", "Analytics"],
  },
  {
    category: "Video & Animation",
    headline: "Video Editor & Motion Designer",
    keywords: ["video", "animation", "motion", "premiere", "after effects", "editing", "3d", "blender", "vfx", "color grading", "film"],
    skills: ["Video Editing", "Motion Graphics", "After Effects", "Premiere Pro", "Color Grading", "Storyboarding"],
  },
  {
    category: "AI & Data",
    headline: "AI & Data Specialist",
    keywords: ["python", "machine learning", " ml ", "artificial intelligence", " ai ", "data scien", "tensorflow", "pytorch", "sql", "pandas", "deep learning", "nlp", "llm", "data analy"],
    skills: ["Python", "Machine Learning", "Data Analysis", "SQL", "TensorFlow", "Prompt Engineering"],
  },
  {
    category: "Writing",
    headline: "Professional Content Writer",
    keywords: ["writing", "copywriting", "content writ", "blog", "editorial", "ghostwrit", "technical writ", "script", "author", "journalist"],
    skills: ["Copywriting", "Content Writing", "Editing", "SEO Writing", "Storytelling", "Research"],
  },
];

function detectYears(text: string): number {
  let years = 0;
  const pattern = /(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const value = Number(match[1]);
    if (value > years && value <= 40) years = value;
  }
  return years;
}

function seniorityPrefix(years: number): string {
  if (years >= 8) return "Principal";
  if (years >= 5) return "Senior";
  return "";
}

export function analyzeResume(text: string): ResumeAnalysis {
  const lower = ` ${text.toLowerCase()} `;

  let best: CategoryHint = CATEGORY_HINTS[0];
  let bestScore = 0;
  for (const hint of CATEGORY_HINTS) {
    const score = hint.keywords.reduce(
      (acc, keyword) => acc + (lower.includes(keyword) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      best = hint;
      bestScore = score;
    }
  }

  const matchedSkills = best.skills.filter((skill) =>
    lower.includes(skill.toLowerCase()),
  );
  const skills = (matchedSkills.length >= 3 ? matchedSkills : best.skills).slice(0, 5);

  const years = detectYears(text);
  const prefix = seniorityPrefix(years);
  const headline = `${prefix} ${best.headline}`.trim();

  const phoneMatch = text.match(/\+?\d[\d\s().-]{6,}\d/);
  const nameLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => {
      const words = line.split(/\s+/);
      return (
        words.length >= 2 &&
        words.length <= 4 &&
        /^[A-Za-z][A-Za-z\s.'-]*$/.test(line) &&
        !line.includes("@")
      );
    });

  return {
    fullName: nameLine ?? "",
    phone: phoneMatch ? phoneMatch[0].trim() : "",
    category: best.category,
    headline,
    skills,
    years,
  };
}

/* ------------------------------ bio composer ------------------------------ */

export function composeBio(input: {
  fullName: string;
  headline: string;
  skills: string[];
  years: number;
}): string {
  const { fullName, headline, skills, years } = input;
  const top = skills.slice(0, 3).join(", ");
  const first = fullName.split(" ")[0] || "This specialist";
  const exp = years > 0 ? ` with ${years}+ years of experience` : "";
  const expCap = years > 0 ? `With ${years}+ years of experience, ` : "";

  const templates = [
    `${fullName} is a results-driven ${headline}${exp}, trusted by international clients for consistent, high-quality delivery. Core strengths include ${top} — paired with clear communication, reliable timelines and measurable outcomes on every engagement.`,
    `${expCap}${first} specialises in ${top} as a ${headline}. Expect a client-first process: sharp scoping, transparent communication and on-time delivery — every project, every time.`,
    `${first} has helped startups and global brands ship standout work across ${top}. As a ${headline}${exp}, the focus is simple: senior-level quality, proactive updates and a finish that exceeds the brief.`,
  ];

  let hash = 0;
  for (let index = 0; index < fullName.length; index += 1) {
    hash = (hash * 31 + fullName.charCodeAt(index)) % 997;
  }
  return templates[hash % templates.length];
}
