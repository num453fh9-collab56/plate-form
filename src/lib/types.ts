export type GigColorPair = [string, string];

export interface Gig {
  id: string;
  sellerId?: string;
  title: string;
  description: string;
  seller: string;
  role: string;
  verified: boolean;
  rating: number;
  reviews: number;
  price: number;
  delivery: string;
  category: string;
  skills: string[];
  badge: string;
  colors: GigColorPair;
  glyph: string;
  video?: string;
  videoName?: string;
  images?: string[];
  packages?: Partial<Record<PackageKey, GigPackage>>;
  extras?: GigExtra[];
  faq?: { question: string; answer: string }[];
  requirementsText?: string;
  requirementQuestions?: RequirementQuestion[];
  tags?: string[];
  status?: GigStatus;
  views?: number;
  createdAt?: string;
  isNew?: boolean;
}

export type PackageKey = "basic" | "standard" | "premium";

export type GigStatus = "draft" | "published" | "paused";

export interface GigPackage {
  name?: string;
  price: number;
  delivery: number;
  note?: string;
  description?: string;
  revisions?: number;
  /** What this tier includes, e.g. "Source files", "Responsive design". */
  features?: string[];
}

export interface GigExtra {
  label: string;
  price: number;
  /** Extra days this add-on adds to delivery (negative = faster). */
  days?: number;
}

export interface RequirementQuestion {
  question: string;
  type: "text" | "file";
  required: boolean;
}

export interface User {
  sub?: string;
  name: string;
  email: string;
  picture?: string;
}

export interface GigDraft {
  title: string;
  description: string;
  category: string;
  skills: string[];
  price: number;
  deliveryDays: number;
  seller: string;
  video?: string;
  videoName?: string;
  images?: string[];
  packages?: Partial<Record<PackageKey, GigPackage>>;
  extras?: GigExtra[];
  faq?: { question: string; answer: string }[];
  requirements?: string;
  requirementQuestions?: RequirementQuestion[];
  tags?: string[];
  status?: GigStatus;
}

export type AuthProvider = "google" | "email";

export interface PortfolioProject {
  id: string;
  userId?: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  link: string;
  image: string;
  cover: string;
  video?: string;
  videoName?: string;
  /** Display order on the profile (0 = first). */
  position?: number;
  updatedAt?: number;
}

export type SkillLevel = "Beginner" | "Intermediate" | "Expert";

export interface Profile {
  fullName: string;
  title: string;
  primaryCategory: string;
  bio: string;
  phone: string;
  country: string;
  languages: string;
  avatar: string;
  /** Ordered — the first three are the freelancer's highlighted top skills. */
  skills: string[];
  /** Proficiency per skill label; skills without an entry count as Intermediate. */
  skillLevels: Record<string, SkillLevel>;
  /** Total professional experience in years ("" = not set). */
  experienceYears: string;
  /** Weekly capacity bucket, e.g. "10-30" (see WEEKLY_HOURS). */
  weeklyHours: string;
  /** Typical response time bucket, e.g. "within-hours" (see RESPONSE_TIMES). */
  responseTime: string;
  /** Profile links by network (linkedin, github, behance, dribbble). The
   *  personal website stays in `portfolio` for backwards compatibility. */
  socialLinks: Record<string, string>;
  hourlyRate: string;
  projectRate: string;
  availability: string;
  portfolio: string;
  introVideo: string;
  introVideoName: string;
  portfolioProjects: PortfolioProject[];
  emailMasked: boolean;
  profilePublic: boolean;
  twoFactor: boolean;
  idVerified: boolean;
  paymentVerified: boolean;
  updatedAt: number;
}

export interface Account {
  id: string;
  email: string;
  name: string;
  picture: string;
  provider: AuthProvider;
  passwordHash: string;
  profile: Profile;
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  version: number;
  accounts: Account[];
  sessionId: string | null;
  updatedAt: number;
}
