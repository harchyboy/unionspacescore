export type DealStage = 'proposal' | 'deal_room' | 'onboarding';

export type DealRoomStatus =
  | 'setup_pending'
  | 'setup_confirmed'
  | 'contracts_pending'
  | 'contracts_in_review'
  | 'contracts_finalised'
  | 'handoff_ready';

export interface Deal {
  id: string;
  tenant: { id: string; name: string };
  property: { id: string; name: string; unit?: string };
  proposal: {
    status: 'Draft' | 'Shared' | 'Accepted' | 'Declined';
    totals: { monthly: number; setup: number };
  };
  stage: DealStage;
}

export interface AgreementPlan {
  dealType: 'AllInclusive' | 'BoltOn';
  services: Array<{
    code: string;
    name: string;
    included: boolean;
    route: 'Landlord' | 'UnionDirect' | 'Supplier';
    notes?: string;
    locked: boolean;
  }>;
  summary: {
    landlordAgreements: number;
    unionAgreements: number;
    supplierAgreements: number;
  };
}

export interface Agreement {
  id: string;
  kind: 'Landlord' | 'Union' | 'Supplier';
  name: string;
  status: 'Drafting' | 'InReview' | 'WithLegal' | 'ReadyToSign' | 'Signed';
  versions: Array<{ id: string; name: string; url?: string; uploadedAt: string }>;
  requiredSigners: Array<{ id: string; name: string }>;
  targetSignDate?: string;
}

export interface HeadsOfTerms {
  id: string;
  version: number;
  fields: Record<string, string>;
  updatedAt: string;
}

export interface FileDoc {
  id: string;
  name: string;
  tag: 'Ops' | 'Fire' | 'Insurance' | 'FitOut' | 'Floorplan' | 'Photo' | 'Other';
  version: number;
  uploadedAt: string;
}

export interface ActivityItem {
  id: string;
  at: string;
  actor: string;
  type: 'DocUploaded' | 'AgreementStatus' | 'Comment' | 'PackGenerated' | 'Handoff';
  note?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  due?: string;
  status: 'Open' | 'InProgress' | 'Blocked' | 'Done';
  group: 'Legal' | 'Ops' | 'Landlord' | 'Internal';
}

export interface DealRoom {
  dealId: string;
  status: DealRoomStatus;
  agreementPlan?: AgreementPlan;
  agreements: Agreement[];
  hots: HeadsOfTerms;
  docs: FileDoc[];
  activity: ActivityItem[];
  tasks: TaskItem[];
}

export interface AppState {
  deal: Deal;
  dealRoom: DealRoom;
}

