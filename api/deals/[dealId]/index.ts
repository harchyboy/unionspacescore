import type { VercelRequest, VercelResponse } from '@vercel/node';

// DealRoomOverview type definition
export interface DealRoomOverview {
  deal: {
    id: string;
    name: string;
    requirementCode: string;
    stage: 'Viewing' | 'Heads of Terms' | 'Legals' | 'Signed' | 'Lost';
    type: 'All inclusive' | 'Bolt on';
    owner: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  requirement: {
    sizeSqFt: number;
    deskCount: number;
    budget: number;
    timing: string;
    targetMoveInDate?: string;
    preferredLocations: string[];
    mustHaves: string[];
    redLines: string[];
    decisionMaker: {
      name: string;
      role: string;
    };
    budgetStatus: string;
  };
  tenantCompany: {
    id: string;
    name: string;
  };
  tenantContact: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
    submarket: string;
  };
  unit: {
    id: string;
    name: string;
    floor: string;
    sizeSqFt: number;
    fitOutStatus: string;
    availabilityDate: string;
    visibilityFlags: string[];
  };
  pricing: {
    monthlyRent: number;
    annualRent: number;
    rentPerSqFt: number;
    businessRates: number;
    serviceCharge: number;
    buildingInsurance: number;
    utilitiesCap: number;
    unionServices: number;
    deposit: {
      months: number;
      amount: number;
    };
    lastPriceChange?: {
      date: string;
      time: string;
      approver: string;
      reason?: string;
    };
  };
  allInclusivePackage?: {
    buildingCosts: {
      rent: number;
      rates: number;
      serviceCharge: number;
      insurance: number;
      total: number;
    };
    managedServices: {
      total: number;
      label: string;
    };
    combinedMonthly: number;
  };
  proposal: {
    label: string;
    issuedDate: string;
    version: number;
    changes?: string;
  };
  proposalVersions?: Array<{
    label: string;
    issuedDate: string;
    version: number;
    url?: string;
  }>;
  managedServices?: {
    basePackage: Array<{
      name: string;
      amount: number;
    }>;
    optionalExtras: Array<{
      name: string;
      amount: number;
    }>;
  };
  contracts: {
    unionServiceAgreement: {
      status: 'Draft' | 'Sent' | 'Signed';
      draftUrl?: string;
      signedDate?: string;
      signedBy?: string;
    };
    landlordLease: {
      status: 'Not started' | 'In legals' | 'Signed';
    };
  };
  operationalNotes?: {
    timelineSensitivities?: string[];
    redFlags?: string[];
  };
  viewingsSummary: {
    nextViewing?: {
      date: string;
      time: string;
      brokerName: string;
      status: string;
    };
    totalViewings: number;
    lastViewingDate?: string;
  };
  headsOfTerms: {
    status: 'Not started' | 'Draft' | 'Sent' | 'Negotiating' | 'Agreed' | 'Out of date';
    termYears?: number;
    breakOption?: string;
    upliftPattern?: string;
    deposit?: {
      months: number;
      amount: number;
    };
    specialConditions?: string;
    latestDocumentUrl?: string;
  };
  documentsSummary: {
    legal: {
      count: number;
      latest?: {
        title: string;
        date: string;
      };
    };
    commercial: {
      count: number;
      latest?: {
        title: string;
        date: string;
      };
    };
    plans: {
      count: number;
      latest?: {
        title: string;
        date: string;
      };
    };
    marketing: {
      count: number;
      latest?: {
        title: string;
        date: string;
      };
    };
  };
  approvals: {
    currentStage: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    lastDecision?: {
      date: string;
      approver: string;
      decision: string;
    };
    openActionsCount: number;
  };
  risk: {
    score: 'High' | 'Medium' | 'Low';
    drivers: string[];
    mitigation?: string;
  };
  activity: Array<{
    id: string;
    title: string;
    type: string;
    userName: string;
    date: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    owner: string;
    dueDate?: string;
    status: 'Open' | 'In progress' | 'Blocked';
  }>;
}

// Mock data
const mockOwners = [
  { id: '1', name: 'Sarah Chen', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
  { id: '2', name: 'Michael Roberts', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
  { id: '3', name: 'Emma Wilson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
  { id: '4', name: 'David Thompson', avatar: undefined },
];

const mockDealOverviews: Record<string, DealRoomOverview> = {
  '1': {
    deal: {
      id: '1',
      name: 'TechCorp Ltd - Principal Place',
      requirementCode: 'REQ-2024-001',
      stage: 'Heads of Terms',
      type: 'All inclusive',
      owner: mockOwners[0],
      createdAt: '2024-01-03T10:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    requirement: {
      sizeSqFt: 2500,
      deskCount: 12,
      budget: 150000,
      timing: 'Q1 2024',
      targetMoveInDate: '2024-03-15',
      preferredLocations: ['Shoreditch', 'City Core'],
      mustHaves: ['Natural light', 'Meeting rooms', 'Kitchen facilities'],
      redLines: ['No ground floor', 'Must have lift access'],
      decisionMaker: { name: 'John Smith', role: 'CEO' },
      budgetStatus: 'Approved within £10,000',
    },
    tenantCompany: { id: 'tenant-1', name: 'TechCorp Ltd' },
    tenantContact: {
      id: 'contact-1',
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+44 20 7123 4567',
      role: 'CEO',
    },
    property: {
      id: 'prop-1',
      name: 'Principal Place',
      address: '100 Principal Place, London',
      submarket: 'Shoreditch',
    },
    unit: {
      id: 'unit-1',
      name: 'Suite 3A',
      floor: '3rd Floor',
      sizeSqFt: 2500,
      fitOutStatus: 'Fitted',
      availabilityDate: '2024-03-01',
      visibilityFlags: ['VAL', 'Website', 'Managed'],
    },
    pricing: {
      monthlyRent: 12500,
      annualRent: 150000,
      rentPerSqFt: 50,
      businessRates: 18000,
      serviceCharge: 24000,
      buildingInsurance: 3000,
      utilitiesCap: 12000,
      unionServices: 36000,
      deposit: { months: 3, amount: 37500 },
      lastPriceChange: {
        date: '2024-01-10',
        time: '14:30',
        approver: 'Sarah Chen',
        reason: 'Updated service charge estimate',
      },
    },
    allInclusivePackage: {
      buildingCosts: {
        rent: 150000,
        rates: 18000,
        serviceCharge: 24000,
        insurance: 3000,
        total: 195000,
      },
      managedServices: {
        total: 36000,
        label: 'Full service package',
      },
      combinedMonthly: 19250,
    },
    proposal: {
      label: 'Proposal v3',
      issuedDate: '2024-01-12',
      version: 3,
      changes: 'Updated service charge estimate and added flexible payment terms',
    },
    proposalVersions: [
      { label: 'Proposal v2', issuedDate: '2024-01-05', version: 2, url: '/documents/proposal-v2.pdf' },
      { label: 'Proposal v1', issuedDate: '2023-12-20', version: 1, url: '/documents/proposal-v1.pdf' },
    ],
    managedServices: {
      basePackage: [
        { name: 'Cleaning services', amount: 10800 },
        { name: 'Maintenance', amount: 9000 },
        { name: 'Security', amount: 7200 },
        { name: 'Utilities management', amount: 5400 },
        { name: 'Reception services', amount: 3600 },
      ],
      optionalExtras: [
        { name: 'Enhanced IT support', amount: 2000 },
        { name: 'Premium meeting room access', amount: 1500 },
      ],
    },
    contracts: {
      unionServiceAgreement: {
        status: 'Draft',
        draftUrl: '/documents/union-agreement-draft.pdf',
      },
      landlordLease: { status: 'Not started' },
    },
    operationalNotes: {
      timelineSensitivities: [
        'Tenant needs to move in by March 15th for Q1 reporting',
        'Fit-out work must be completed before move-in',
      ],
      redFlags: [
        'Budget approval still pending from CFO',
      ],
    },
    viewingsSummary: {
      nextViewing: {
        date: '2024-01-20',
        time: '14:00',
        brokerName: 'Sarah Chen',
        status: 'Confirmed',
      },
      totalViewings: 3,
      lastViewingDate: '2024-01-15',
    },
    headsOfTerms: {
      status: 'Draft',
      termYears: 5,
      breakOption: 'Year 3',
      upliftPattern: '3% annual',
      deposit: { months: 3, amount: 37500 },
      specialConditions: 'Fit-out contribution of £50,000',
      latestDocumentUrl: '/documents/hots-v1.pdf',
    },
    documentsSummary: {
      legal: { count: 2, latest: { title: 'Heads of Terms v1', date: '2024-01-12' } },
      commercial: { count: 4, latest: { title: 'Proposal v3', date: '2024-01-12' } },
      plans: { count: 1, latest: { title: 'Floor plan 3A', date: '2024-01-08' } },
      marketing: { count: 0 },
    },
    approvals: {
      currentStage: 'Commercial approval',
      status: 'Pending',
      lastDecision: {
        date: '2024-01-10',
        approver: 'Michael Roberts',
        decision: 'Requested pricing review',
      },
      openActionsCount: 2,
    },
    risk: {
      score: 'Medium',
      drivers: ['Budget constraints', 'Timeline pressure'],
      mitigation: 'Extended payment terms agreed',
    },
    activity: [
      { id: 'a1', title: 'Proposal v3 issued', type: 'Proposal', userName: 'Sarah Chen', date: '2024-01-12T10:00:00Z' },
      { id: 'a2', title: 'Viewing completed', type: 'Viewing', userName: 'Sarah Chen', date: '2024-01-15T14:00:00Z' },
      { id: 'a3', title: 'Heads of Terms drafted', type: 'Document', userName: 'Sarah Chen', date: '2024-01-12T16:00:00Z' },
      { id: 'a4', title: 'Price updated', type: 'Pricing', userName: 'Sarah Chen', date: '2024-01-10T14:30:00Z' },
      { id: 'a5', title: 'Approval requested', type: 'Approval', userName: 'Sarah Chen', date: '2024-01-10T09:00:00Z' },
    ],
    tasks: [
      { id: 't1', title: 'Send updated HoTs to tenant', owner: 'Sarah Chen', dueDate: '2024-01-20', status: 'Open' },
      { id: 't2', title: 'Chase legal comments', owner: 'Sarah Chen', dueDate: '2024-01-22', status: 'In progress' },
      { id: 't3', title: 'Schedule follow-up meeting', owner: 'Sarah Chen', dueDate: '2024-01-18', status: 'Open' },
    ],
  },
  '2': {
    deal: {
      id: '2',
      name: 'FinanceHub - The Leadenhall Building',
      requirementCode: 'REQ-2024-002',
      stage: 'Legals',
      type: 'Bolt on',
      owner: mockOwners[1],
      createdAt: '2023-12-20T14:00:00Z',
      updatedAt: '2024-01-14T14:20:00Z',
    },
    requirement: {
      sizeSqFt: 3200,
      deskCount: 16,
      budget: 250000,
      timing: 'Q2 2024',
      targetMoveInDate: '2024-04-01',
      preferredLocations: ['City Core'],
      mustHaves: ['High floor', 'City views', 'Reception'],
      redLines: ['No shared facilities'],
      decisionMaker: { name: 'Sarah Johnson', role: 'CFO' },
      budgetStatus: 'Approved within £15,000',
    },
    tenantCompany: { id: 'tenant-2', name: 'FinanceHub' },
    tenantContact: {
      id: 'contact-2',
      name: 'Sarah Johnson',
      email: 'sarah.j@financehub.com',
      role: 'CFO',
    },
    property: {
      id: 'prop-2',
      name: 'The Leadenhall Building',
      address: '122 Leadenhall Street, London',
      submarket: 'City Core',
    },
    unit: {
      id: 'unit-2',
      name: 'Level 15',
      floor: '15th Floor',
      sizeSqFt: 3200,
      fitOutStatus: 'Part Fitted',
      availabilityDate: '2024-04-01',
      visibilityFlags: ['VAL', 'Website'],
    },
    pricing: {
      monthlyRent: 12000,
      annualRent: 144000,
      rentPerSqFt: 45,
      businessRates: 22000,
      serviceCharge: 28000,
      buildingInsurance: 4000,
      utilitiesCap: 15000,
      unionServices: 25000,
      deposit: { months: 3, amount: 36000 },
    },
    proposal: {
      label: 'Proposal v2',
      issuedDate: '2024-01-05',
      version: 2,
      changes: 'Adjusted pricing based on market conditions',
    },
    proposalVersions: [
      { label: 'Proposal v1', issuedDate: '2023-12-15', version: 1, url: '/documents/proposal-v1.pdf' },
    ],
    managedServices: {
      basePackage: [
        { name: 'Cleaning services', amount: 7500 },
        { name: 'Maintenance', amount: 6250 },
        { name: 'Security', amount: 5000 },
        { name: 'Utilities management', amount: 3750 },
        { name: 'Reception services', amount: 2500 },
      ],
      optionalExtras: [],
    },
    contracts: {
      unionServiceAgreement: {
        status: 'Sent',
        draftUrl: '/documents/union-agreement-sent.pdf',
      },
      landlordLease: { status: 'In legals' },
    },
    viewingsSummary: {
      totalViewings: 2,
      lastViewingDate: '2024-01-10',
    },
    headsOfTerms: {
      status: 'Agreed',
      termYears: 7,
      breakOption: 'Year 5',
      upliftPattern: 'RPI linked',
      latestDocumentUrl: '/documents/hots-final.pdf',
    },
    documentsSummary: {
      legal: { count: 5, latest: { title: 'Lease draft v2', date: '2024-01-14' } },
      commercial: { count: 3, latest: { title: 'Proposal v2', date: '2024-01-05' } },
      plans: { count: 2, latest: { title: 'Floor plan Level 15', date: '2024-01-08' } },
      marketing: { count: 1, latest: { title: 'Property brochure', date: '2024-01-02' } },
    },
    approvals: {
      currentStage: 'Legal review',
      status: 'Approved',
      lastDecision: {
        date: '2024-01-12',
        approver: 'Michael Roberts',
        decision: 'Approved for legal stage',
      },
      openActionsCount: 0,
    },
    risk: {
      score: 'Low',
      drivers: [],
      mitigation: 'All approvals cleared',
    },
    activity: [
      { id: 'a1', title: 'Lease draft updated', type: 'Document', userName: 'Michael Roberts', date: '2024-01-14T14:20:00Z' },
      { id: 'a2', title: 'Heads of Terms agreed', type: 'Document', userName: 'Michael Roberts', date: '2024-01-10T11:00:00Z' },
      { id: 'a3', title: 'Proposal v2 issued', type: 'Proposal', userName: 'Michael Roberts', date: '2024-01-05T09:00:00Z' },
    ],
    tasks: [
      { id: 't1', title: 'Review lease amendments', owner: 'Michael Roberts', dueDate: '2024-01-25', status: 'In progress' },
    ],
  },
};

// Default overview for any deal ID not in mock data
const defaultOverview: DealRoomOverview = {
  deal: {
    id: 'default',
    name: 'Default Deal',
    requirementCode: 'REQ-2024-000',
    stage: 'Viewing',
    type: 'All inclusive',
    owner: mockOwners[0],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  requirement: {
    sizeSqFt: 2000,
    deskCount: 10,
    budget: 120000,
    timing: 'Q1 2024',
    targetMoveInDate: '2024-03-01',
    preferredLocations: ['City Core'],
    mustHaves: ['Natural light'],
    redLines: [],
    decisionMaker: { name: 'Contact Name', role: 'CEO' },
    budgetStatus: 'Needs additional sign off',
  },
  tenantCompany: { id: 'tenant-default', name: 'Default Company' },
  tenantContact: { id: 'contact-default', name: 'Contact Name', role: 'CEO' },
  property: { id: 'prop-default', name: 'Default Property', address: 'Address', submarket: 'City Core' },
  unit: {
    id: 'unit-default',
    name: 'Unit 1',
    floor: '1st Floor',
    sizeSqFt: 2000,
    fitOutStatus: 'Fitted',
    availabilityDate: '2024-03-01',
    visibilityFlags: ['VAL'],
  },
  pricing: {
    monthlyRent: 10000,
    annualRent: 120000,
    rentPerSqFt: 50,
    businessRates: 15000,
    serviceCharge: 20000,
    buildingInsurance: 2500,
    utilitiesCap: 10000,
    unionServices: 30000,
    deposit: { months: 3, amount: 30000 },
  },
  proposal: { label: 'Proposal v1', issuedDate: '2024-01-01', version: 1 },
  contracts: {
    unionServiceAgreement: { status: 'Draft' },
    landlordLease: { status: 'Not started' },
  },
  viewingsSummary: { totalViewings: 0 },
  headsOfTerms: { status: 'Not started' },
  documentsSummary: {
    legal: { count: 0 },
    commercial: { count: 0 },
    plans: { count: 0 },
    marketing: { count: 0 },
  },
  approvals: {
    currentStage: 'Initial review',
    status: 'Pending',
    openActionsCount: 1,
  },
  risk: {
    score: 'Medium',
    drivers: ['New requirement'],
  },
  activity: [],
  tasks: [],
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { dealId } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/deals/:dealId
  if (method === 'GET' && dealId) {
    const overview = mockDealOverviews[dealId as string] || defaultOverview;
    return res.status(200).json(overview);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

