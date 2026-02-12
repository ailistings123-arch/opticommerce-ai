import { Timestamp } from 'firebase/firestore';

export type Platform = 'amazon' | 'shopify' | 'etsy' | 'ebay';
export type Tier = 'free' | 'basic' | 'premium';

export interface User {
  email: string;
  displayName: string;
  photoURL?: string | null;
  tier: Tier;
  usageCount: number;
  usageLimit: number;
  resetDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OptimizationInput {
  title: string;
  description: string;
  platform: Platform;
  keywords?: string;
}

export interface OptimizedContent {
  title: string;
  description: string;
  tags: string[];
  seoScore: number;
  improvements: string[];
}

export interface Optimization {
  id?: string;
  userId: string;
  platform: Platform;
  original: {
    title: string;
    description: string;
    keywords?: string;
  };
  optimized: OptimizedContent;
  createdAt: Timestamp;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'QUOTA_EXCEEDED' | 'UNAUTHORIZED' | 'INVALID_INPUT' | 'AI_ERROR' | 'SERVER_ERROR';
}

export interface PlatformRules {
  name: string;
  titleRange: { min: number; max: number };
  minDescription: number;
  maxTags: number;
  tagFormat: string;
  guidelines: string[];
}

export interface TierLimits {
  free: number;
  basic: number;
  premium: number;
}
