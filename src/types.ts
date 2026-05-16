export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  language: 'en' | 'ur' | 'hi';
  coverImage?: string;
  pdfUrl: string;
  keywords: string[];
  featured: boolean;
  trending: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
}

export type Language = 'en' | 'ur' | 'hi';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  favorites: string[]; // Book IDs
}
