export type CompanyType =
  | 'Brokerage'
  | 'Landlord'
  | 'Tenant'
  | 'Supplier'
  | 'Other';

export interface CompanyContact {
  id: string;
  name: string;
  email?: string | null;
  role?: string | null;
}

export interface Company {
  id: string;
  name: string;
  type?: CompanyType | null;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  employeeCount?: number | null;
  annualRevenue?: number | null;
  description?: string | null;
  logo?: string | null;
  // Relationship data
  contacts?: CompanyContact[];
  contactCount?: number | null;
  activeDeals?: number | null;
  totalDeals?: number | null;
  relationshipHealth?: 'excellent' | 'good' | 'fair' | 'needs-attention' | null;
  lastActivity?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CompanyListResponse {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  moreRecords?: boolean;
}

export interface CompanyFilters {
  type?: CompanyType;
  industry?: string;
  city?: string;
  query?: string;
}
