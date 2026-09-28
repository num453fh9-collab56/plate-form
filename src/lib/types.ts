export type GigColorPair = [string, string];

export interface Gig {
  id: string;
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
  badge: string;
  colors: GigColorPair;
  glyph: string;
  isNew?: boolean;
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
  price: number;
  deliveryDays: number;
  seller: string;
}

export type AuthProvider = "google" | "email";

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  link: string;
  cover: string;
  updatedAt?: number;
}

export interface Profile {
  fullName: string;
  title: string;
  bio: string;
  phone: string;
  country: string;
  languages: string;
  avatar: string;
  skills: string[];
  hourlyRate: string;
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
