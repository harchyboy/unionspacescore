export type DealId = string;

export type ProposalConfigStatus = 'none' | 'draft' | 'complete';

export type DealType = 'AllInclusive' | 'BoltOn';

export type ServiceRoute = 'BundledInRent' | 'LandlordAgreement' | 'UnionAgreement';

export type ServiceCategory =
  | 'Base'
  | 'Cleaning'
  | 'Internet'
  | 'ITSupport'
  | 'AV'
  | 'MeetingRooms'
  | 'Printing'
  | 'Coffee'
  | 'FoodBeverage'
  | 'Plants'
  | 'DaytimeHousekeeper'
  | 'OtherVariable';

export type DealStage =
  | 'Lead'
  | 'Qualification'
  | 'Proposal'
  | 'ProposalAccepted'
  | 'DealRoom'
  | 'Signed'
  | 'Live';

export interface ServiceLine {
  id: string;
  dealId: string;
  name: string;
  category: ServiceCategory;
  included: boolean;
  route: ServiceRoute;
  isPostSignAddition: boolean;
}

export interface DealRequirement {
  desks?: number;
  sizeSqFt?: { min?: number; max?: number };
  locations?: string[];
  moveWindow?: { start?: string; end?: string };
  budget?: { min?: number; max?: number };
  fitOut?: 'Unfitted' | 'Part Fitted' | 'Fitted';
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
  // New fields for deal structure
  type?: DealType;
  propertyId?: string;
  tenantCompanyId?: string;
  serviceLines?: ServiceLine[];
}

