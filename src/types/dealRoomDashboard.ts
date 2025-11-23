export type DealRoomStage = 'Inquiry' | 'Viewing' | 'Heads of Terms' | 'Legals' | 'Signed' | 'Lost';

export type DealType = 'All inclusive' | 'Bolt on';

export type RiskLevel = 'High' | 'Medium' | 'Low';

export type ApprovalStatus = 'Pending' | 'Clear';

export interface DealOwner {
  id: string;
  name: string;
  avatar?: string;
}

export interface TenantContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface DealRoomDeal {
  id: string;
  name: string;
  requirementCode?: string;
  property: {
    id: string;
    name: string;
    unit?: string;
    floor?: string;
  };
  tenant: {
    id: string;
    companyName: string;
    mainContact?: TenantContact;
  };
  stage: DealRoomStage;
  owner: DealOwner;
  commercial: {
    monthlyRent?: number;
    totalAnnualValue?: number;
  };
  status: {
    risk: RiskLevel;
    approvals: ApprovalStatus;
  };
  nextStep?: {
    type: 'viewing' | 'approval' | 'task';
    date?: string;
    description: string;
  };
  type: DealType;
  updatedAt: string;
  daysInStage?: number;
}

export interface DealRoomSummary {
  totalOpenDeals: number;
  totalMonthlyValue: number;
  averageDaysInStage: number;
}

export interface DealRoomResponse {
  deals: DealRoomDeal[];
  summary: DealRoomSummary;
}

export interface DealRoomFilters {
  stage?: DealRoomStage | 'all';
  owner?: string | 'all';
  dealType?: DealType | 'all';
  property?: string | 'all';
  search?: string;
}

