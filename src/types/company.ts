export type CompanyType = "Agency" | "Landlord" | "Supplier" | "Client";

export type CompanyStatus = "Active" | "Dormant" | "Prospect";

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  relationshipOwner: string;
  status: CompanyStatus;
  totalViewingsYTD: number;
  totalDealsYTD: number;
  totalRevenueYTD: number;
}

export interface CreateCompanyInput {
  name: string;
  type: CompanyType;
  relationshipOwner: string;
  status: CompanyStatus;
  notes?: string;
}

