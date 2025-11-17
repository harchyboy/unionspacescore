export type DealId = string;

export type ProposalConfigStatus = 'none' | 'draft' | 'complete';

export interface DealRequirement {
  desks?: number;
  sizeSqFt?: { min?: number; max?: number };
  locations?: string[];
  moveWindow?: { start?: string; end?: string };
  budget?: { min?: number; max?: number };
  fitOut?: 'Shell' | 'Cat A' | 'Cat A+';
  amenities?: string[];
}

export interface Deal {
  id: DealId;
  name: string;
  tenant?: string;
  property?: string;
  stage?: string;
  status?: string;
  proposalConfigStatus?: ProposalConfigStatus;
  // For backward compatibility, also support boolean flag
  hasProposalConfiguration?: boolean;
  requirement?: DealRequirement;
  createdAt?: string;
  updatedAt?: string;
}

