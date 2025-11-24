import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DealRoomResponse, DealRoomDeal, DealRoomSummary } from '../src/types/dealRoomDashboard.js';

// Mock deal owners
const mockOwners = [
  { id: '1', name: 'Sarah Chen', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
  { id: '2', name: 'Michael Roberts', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
  { id: '3', name: 'Emma Wilson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
  { id: '4', name: 'David Thompson', avatar: undefined },
];

// Mock deals data - same as MSW mocks
const mockDeals: DealRoomDeal[] = [
  {
    id: '1',
    name: 'TechCorp Ltd - Principal Place',
    requirementCode: 'REQ-2024-001',
    property: {
      id: 'prop-1',
      name: 'Principal Place',
      unit: 'Suite 3A',
      floor: '3rd Floor',
    },
    tenant: {
      id: 'tenant-1',
      companyName: 'TechCorp Ltd',
      mainContact: {
        id: 'contact-1',
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        phone: '+44 20 7123 4567',
      },
    },
    stage: 'Heads of Terms',
    owner: mockOwners[0],
    commercial: {
      monthlyRent: 12500,
      totalAnnualValue: 150000,
    },
    status: {
      risk: 'Medium',
      approvals: 'Pending',
    },
    nextStep: {
      type: 'approval',
      date: '2024-01-20',
      description: 'Chase legal comments',
    },
    type: 'All inclusive',
    updatedAt: '2024-01-15T10:30:00Z',
    daysInStage: 12,
  },
  {
    id: '2',
    name: 'FinanceHub - The Leadenhall Building',
    requirementCode: 'REQ-2024-002',
    property: {
      id: 'prop-2',
      name: 'The Leadenhall Building',
      unit: 'Level 15',
      floor: '15th Floor',
    },
    tenant: {
      id: 'tenant-2',
      companyName: 'FinanceHub',
      mainContact: {
        id: 'contact-2',
        name: 'Sarah Johnson',
        email: 'sarah.j@financehub.com',
      },
    },
    stage: 'Legals',
    owner: mockOwners[1],
    commercial: {
      monthlyRent: 18500,
      totalAnnualValue: 222000,
    },
    status: {
      risk: 'Low',
      approvals: 'Clear',
    },
    nextStep: {
      type: 'task',
      description: 'Send updated HoTs',
    },
    type: 'Bolt on',
    updatedAt: '2024-01-14T14:20:00Z',
    daysInStage: 8,
  },
  {
    id: '3',
    name: 'StartupCo - 99 Bishopsgate',
    requirementCode: 'REQ-2024-003',
    property: {
      id: 'prop-3',
      name: '99 Bishopsgate',
      unit: 'Unit 5B',
      floor: '5th Floor',
    },
    tenant: {
      id: 'tenant-3',
      companyName: 'StartupCo',
      mainContact: {
        id: 'contact-3',
        name: 'Alex Brown',
        phone: '+44 20 7987 6543',
      },
    },
    stage: 'Viewing',
    owner: mockOwners[2],
    commercial: {
      monthlyRent: 8500,
      totalAnnualValue: 102000,
    },
    status: {
      risk: 'High',
      approvals: 'Pending',
    },
    nextStep: {
      type: 'viewing',
      date: '2024-01-18',
      description: 'Scheduled viewing',
    },
    type: 'All inclusive',
    updatedAt: '2024-01-16T09:15:00Z',
    daysInStage: 5,
  },
  {
    id: '4',
    name: 'MediaWorks - Shoreditch Workspace',
    requirementCode: 'REQ-2024-004',
    property: {
      id: 'prop-4',
      name: 'Shoreditch Workspace',
      unit: 'Studio 2',
      floor: 'Ground Floor',
    },
    tenant: {
      id: 'tenant-4',
      companyName: 'MediaWorks',
      mainContact: {
        id: 'contact-4',
        name: 'Lisa Anderson',
        email: 'lisa@mediaworks.com',
      },
    },
    stage: 'Inquiry',
    owner: mockOwners[3],
    commercial: {
      monthlyRent: 6200,
      totalAnnualValue: 74400,
    },
    status: {
      risk: 'Medium',
      approvals: 'Clear',
    },
    nextStep: {
      type: 'task',
      description: 'Send initial proposal',
    },
    type: 'Bolt on',
    updatedAt: '2024-01-17T11:45:00Z',
    daysInStage: 2,
  },
  {
    id: '5',
    name: 'LegalFirm - One Canada Square',
    requirementCode: 'REQ-2024-005',
    property: {
      id: 'prop-5',
      name: 'One Canada Square',
      unit: 'Suite 200',
      floor: '20th Floor',
    },
    tenant: {
      id: 'tenant-5',
      companyName: 'LegalFirm',
      mainContact: {
        id: 'contact-5',
        name: 'Robert Taylor',
        email: 'r.taylor@legalfirm.com',
        phone: '+44 20 7123 9876',
      },
    },
    stage: 'Signed',
    owner: mockOwners[0],
    commercial: {
      monthlyRent: 22000,
      totalAnnualValue: 264000,
    },
    status: {
      risk: 'Low',
      approvals: 'Clear',
    },
    nextStep: {
      type: 'task',
      description: 'Up to date',
    },
    type: 'All inclusive',
    updatedAt: '2024-01-10T16:00:00Z',
    daysInStage: 45,
  },
  {
    id: '6',
    name: 'ConsultingGroup - Broadgate Circle',
    requirementCode: 'REQ-2024-006',
    property: {
      id: 'prop-6',
      name: 'Broadgate Circle',
      unit: 'Office 12',
      floor: '2nd Floor',
    },
    tenant: {
      id: 'tenant-6',
      companyName: 'ConsultingGroup',
      mainContact: {
        id: 'contact-6',
        name: 'Jennifer White',
        email: 'j.white@consultinggroup.com',
      },
    },
    stage: 'Heads of Terms',
    owner: mockOwners[1],
    commercial: {
      monthlyRent: 15000,
      totalAnnualValue: 180000,
    },
    status: {
      risk: 'Medium',
      approvals: 'Pending',
    },
    nextStep: {
      type: 'approval',
      date: '2024-01-22',
      description: 'Next approval due',
    },
    type: 'Bolt on',
    updatedAt: '2024-01-15T13:30:00Z',
    daysInStage: 10,
  },
  {
    id: '7',
    name: 'DesignStudio - Clerkenwell Green',
    requirementCode: 'REQ-2024-007',
    property: {
      id: 'prop-7',
      name: 'Clerkenwell Green',
      unit: 'Unit 8',
      floor: '1st Floor',
    },
    tenant: {
      id: 'tenant-7',
      companyName: 'DesignStudio',
      mainContact: {
        id: 'contact-7',
        name: 'Tom Davis',
        phone: '+44 20 7456 7890',
      },
    },
    stage: 'Viewing',
    owner: mockOwners[2],
    commercial: {
      monthlyRent: 9200,
      totalAnnualValue: 110400,
    },
    status: {
      risk: 'Low',
      approvals: 'Clear',
    },
    nextStep: {
      type: 'viewing',
      date: '2024-01-19',
      description: 'Scheduled viewing',
    },
    type: 'All inclusive',
    updatedAt: '2024-01-16T10:00:00Z',
    daysInStage: 4,
  },
  {
    id: '8',
    name: 'RetailBrand - Oxford Street',
    requirementCode: 'REQ-2024-008',
    property: {
      id: 'prop-8',
      name: 'Oxford Street',
      unit: 'Shop 5',
      floor: 'Ground Floor',
    },
    tenant: {
      id: 'tenant-8',
      companyName: 'RetailBrand',
      mainContact: {
        id: 'contact-8',
        name: 'Maria Garcia',
        email: 'maria@retailbrand.com',
      },
    },
    stage: 'Legals',
    owner: mockOwners[3],
    commercial: {
      monthlyRent: 11000,
      totalAnnualValue: 132000,
    },
    status: {
      risk: 'High',
      approvals: 'Pending',
    },
    nextStep: {
      type: 'task',
      description: 'Review contract amendments',
    },
    type: 'Bolt on',
    updatedAt: '2024-01-14T15:20:00Z',
    daysInStage: 15,
  },
];

function calculateSummary(deals: DealRoomDeal[]): DealRoomSummary {
  const openDeals = deals.filter((d) => d.stage !== 'Signed' && d.stage !== 'Lost');
  const totalMonthlyValue = openDeals.reduce((sum, deal) => sum + (deal.commercial.monthlyRent || 0), 0);
  const totalDaysInStage = openDeals.reduce((sum, deal) => sum + (deal.daysInStage || 0), 0);
  const averageDaysInStage = openDeals.length > 0 ? Math.round(totalDaysInStage / openDeals.length) : 0;

  return {
    totalOpenDeals: openDeals.length,
    totalMonthlyValue,
    averageDaysInStage,
  };
}

function filterDeals(deals: DealRoomDeal[], query: VercelRequest['query']): DealRoomDeal[] {
  let filtered = [...deals];

  const stage = query.stage as string;
  if (stage && stage !== 'all') {
    filtered = filtered.filter((d) => d.stage === stage);
  }

  const owner = query.owner as string;
  if (owner && owner !== 'all') {
    filtered = filtered.filter((d) => d.owner.id === owner);
  }

  const dealType = query.dealType as string;
  if (dealType && dealType !== 'all') {
    filtered = filtered.filter((d) => d.type === dealType);
  }

  const property = query.property as string;
  if (property && property !== 'all') {
    filtered = filtered.filter((d) => d.property.id === property);
  }

  const search = (query.search as string)?.toLowerCase();
  if (search) {
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(search) ||
        d.tenant.companyName.toLowerCase().includes(search) ||
        (d.requirementCode && d.requirementCode.toLowerCase().includes(search))
    );
  }

  return filtered;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/deals - List deals with filters
  if (method === 'GET') {
    const filteredDeals = filterDeals(mockDeals, req.query);
    const summary = calculateSummary(filteredDeals);

    const response: DealRoomResponse = {
      deals: filteredDeals,
      summary,
    };

    return res.status(200).json(response);
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

