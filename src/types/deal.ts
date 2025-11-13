export type DealId = string;

export type ProposalConfigStatus = 'none' | 'draft' | 'complete';

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
  createdAt?: string;
  updatedAt?: string;
}

