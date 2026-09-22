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
