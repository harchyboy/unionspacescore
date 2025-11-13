import type { Property, PropertyId, Unit } from './property';
import type { DealId } from './deal';

export type MatchCategory = 'best-match' | 'good-match' | 'fair-match';

export interface MatchReason {
  type: 'location' | 'size' | 'price' | 'amenities' | 'availability' | 'fit-out';
  description: string;
  score: number;
}

export interface PropertyMatch {
  property: Property;
  unit?: Unit;
  matchScore: number; // 0-100
  category: MatchCategory;
  reasons: MatchReason[];
  isShortlisted?: boolean;
}

export interface MatchingResult {
  dealId: DealId;
  matches: PropertyMatch[];
  totalMatches: number;
  lastUpdated?: string;
}

