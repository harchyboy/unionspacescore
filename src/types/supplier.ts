export type SupplierCategory = 
  | 'Cleaning'
  | 'AV & IT'
  | 'R&M'
  | 'Plants'
  | 'Coffee'
  | 'Furniture'
  | 'Utilities'
  | 'Other';

export type SupplierContractStatus = 'Active' | 'Trial' | 'Suspended' | 'None';

export type ComplianceStatus = 'Current' | 'Expiring' | 'Expired' | 'Pending';

export interface SupplierContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary?: boolean;
  avatar?: string;
}

export interface WorkOrder {
  id: string;
  number: string;
  supplierId: string;
  property: string;
  unit: string;
  description: string;
  details: string;
  status: 'Pending' | 'In Progress' | 'Scheduled' | 'Awaiting Parts' | 'Completed';
  slaTimeLeft?: string;
  slaPercentUsed?: number;
  assignedTo?: SupplierContact;
  attachments?: number;
  createdAt: string;
}

export interface SupplierDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xlsx' | 'other';
  uploadedAt: string;
}

export interface SupplierContract {
  id: string;
  name: string;
  type: 'Master Service Agreement' | 'SLA Agreement' | 'Rate Card' | 'Other';
  status: SupplierContractStatus;
  value?: string;
  startDate?: string;
  renewalDate?: string;
  noticePeriod?: string;
  responseTarget?: string;
  resolutionTarget?: string;
  criticalResponse?: string;
  uptimeGuarantee?: string;
}

export interface PropertyPerformance {
  property: string;
  workOrders: number;
  onTimePercent: number;
  firstFixPercent: number;
  avgResponse: string;
  totalCost: string;
  rating: number;
}

export interface Supplier {
  id: string;
  name: string;
  initials: string;
  category: SupplierCategory;
  coverage: string[];
  openWorkOrders: number;
  slaPercentage: number;
  contractStatus: SupplierContractStatus;
  lastJobAt: string;
  rating?: number;
  description?: string;
  contacts: SupplierContact[];
  hours?: string;
  baseRate?: number;
  callOutFee?: number;
  leadTimes?: string;
  responseTimeTarget?: number;
  resolutionTimeTarget?: number;
  contracts?: SupplierContract[];
  documents?: SupplierDocument[];
  complianceStatus?: ComplianceStatus;
  complianceNote?: string;
  specialArrangement?: string;
  createdAt: string;
  updatedAt: string;
}

// Performance metrics for supplier detail
export interface SupplierPerformance {
  activeWorkOrders: number;
  dueThisWeek: number;
  avgResponseTime: string;
  responseTarget: string;
  onTimeCompletion: number;
  onTimeChange: string;
  contractValue: string;
  contractPeriod: string;
  onTimeDelivery: number;
  firstTimeFixRate: number;
  customerSatisfaction: number;
  propertyPerformance: PropertyPerformance[];
}

// Activity item for supplier detail
export interface SupplierActivity {
  id: string;
  type: 'work_order' | 'sla_breach' | 'compliance' | 'onboarding' | 'contract';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconBg?: string;
}

// Communication item for supplier detail
export interface SupplierCommunication {
  id: string;
  type: 'email' | 'ticket' | 'phone' | 'meeting';
  senderName: string;
  senderAvatar?: string;
  subject: string;
  content: string;
  timestamp: string;
  attachments?: number;
  status?: string;
}

