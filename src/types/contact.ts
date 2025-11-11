export type ContactType =
  | 'flex-broker'
  | 'disposal-agent'
  | 'tenant'
  | 'landlord'
  | 'supplier'
  | 'internal';

export type RelationshipHealth = 'excellent' | 'good' | 'fair' | 'needs-attention';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  companyId?: string;
  type: ContactType;
  role?: string;
  avatar?: string;
  territory?: string;
  submarkets?: string[];
  specialisms?: string[];
  preferredSubmarkets?: string[];
  referralSource?: string;
  commissionStructure?: string;
  relationshipHealth: RelationshipHealth;
  relationshipHealthScore?: number; // 0-100
  lastActivity?: string;
  lastContacted?: string;
  openDeals?: number;
  openViewings?: number;
  totalDeals?: number;
  totalViewings?: number;
  notes?: string;
  commsPreferences?: {
    email: boolean;
    phone: boolean;
    sms: boolean;
    preferredMethod: 'email' | 'phone' | 'sms';
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactFilters {
  type?: ContactType | 'all';
  company?: string;
  submarket?: string;
  activity?: string;
  health?: RelationshipHealth | 'all';
  query?: string;
}

export interface ContactListParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'lastActivity' | 'health' | 'company';
  sortOrder?: 'asc' | 'desc';
  filters?: ContactFilters;
}

export interface ContactListResponse {
  items: Contact[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  type: ContactType;
  role?: string;
  territory?: string;
  submarkets?: string[];
  specialisms?: string[];
  notes?: string;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
  relationshipHealth?: RelationshipHealth;
  relationshipHealthScore?: number;
}

