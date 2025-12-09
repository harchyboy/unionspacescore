import { http, HttpResponse, passthrough } from 'msw';
import type { Company, CompanyListResponse } from '../../types/company';

// Mock company data - representing companies synced from Zoho CRM
const mockCompanies: Company[] = [
  {
    id: 'acc-001',
    name: 'Knight Frank',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.knightfrank.co.uk',
    phone: '+44 20 7629 8171',
    address: '55 Baker Street',
    city: 'London',
    postcode: 'W1U 8AN',
    country: 'United Kingdom',
    employeeCount: 5000,
    contactCount: 12,
    activeDeals: 5,
    totalDeals: 28,
    relationshipHealth: 'excellent',
    lastActivity: '2024-01-15T10:30:00Z',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'acc-002',
    name: 'Savills',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.savills.co.uk',
    phone: '+44 20 7409 8756',
    address: '33 Margaret Street',
    city: 'London',
    postcode: 'W1G 0JD',
    country: 'United Kingdom',
    employeeCount: 4500,
    contactCount: 8,
    activeDeals: 3,
    totalDeals: 22,
    relationshipHealth: 'excellent',
    lastActivity: '2024-01-13T14:20:00Z',
    createdAt: '2023-02-20T10:00:00Z',
    updatedAt: '2024-01-13T14:20:00Z',
  },
  {
    id: 'acc-003',
    name: 'CBRE',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.cbre.co.uk',
    phone: '+44 20 7182 2000',
    address: 'Henrietta House, Henrietta Place',
    city: 'London',
    postcode: 'W1G 0NB',
    country: 'United Kingdom',
    employeeCount: 6000,
    contactCount: 15,
    activeDeals: 7,
    totalDeals: 35,
    relationshipHealth: 'excellent',
    lastActivity: '2024-01-14T11:00:00Z',
    createdAt: '2023-01-10T10:00:00Z',
    updatedAt: '2024-01-14T11:00:00Z',
  },
  {
    id: 'acc-004',
    name: 'JLL',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.jll.co.uk',
    phone: '+44 20 7493 4933',
    address: '30 Warwick Street',
    city: 'London',
    postcode: 'W1B 5NH',
    country: 'United Kingdom',
    employeeCount: 5500,
    contactCount: 10,
    activeDeals: 4,
    totalDeals: 18,
    relationshipHealth: 'good',
    lastActivity: '2024-01-12T16:45:00Z',
    createdAt: '2023-03-05T10:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
  },
  {
    id: 'acc-005',
    name: 'Cushman & Wakefield',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.cushmanwakefield.com/en/united-kingdom',
    phone: '+44 20 3296 3000',
    address: '125 Old Broad Street',
    city: 'London',
    postcode: 'EC2N 1AR',
    country: 'United Kingdom',
    employeeCount: 4000,
    contactCount: 6,
    activeDeals: 2,
    totalDeals: 12,
    relationshipHealth: 'good',
    lastActivity: '2024-01-10T09:30:00Z',
    createdAt: '2023-04-12T10:00:00Z',
    updatedAt: '2024-01-10T09:30:00Z',
  },
  {
    id: 'acc-006',
    name: 'Colliers',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.colliers.com/en-gb',
    phone: '+44 20 7935 4499',
    address: '50 George Street',
    city: 'London',
    postcode: 'W1U 7GA',
    country: 'United Kingdom',
    employeeCount: 3500,
    contactCount: 5,
    activeDeals: 1,
    totalDeals: 8,
    relationshipHealth: 'good',
    lastActivity: '2024-01-08T14:15:00Z',
    createdAt: '2023-05-18T10:00:00Z',
    updatedAt: '2024-01-08T14:15:00Z',
  },
  {
    id: 'acc-007',
    name: 'BNP Paribas Real Estate',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.realestate.bnpparibas.co.uk',
    phone: '+44 20 7338 4000',
    address: '5 Aldermanbury Square',
    city: 'London',
    postcode: 'EC2V 7BP',
    country: 'United Kingdom',
    employeeCount: 2500,
    contactCount: 4,
    activeDeals: 2,
    totalDeals: 6,
    relationshipHealth: 'fair',
    lastActivity: '2024-01-05T11:30:00Z',
    createdAt: '2023-06-22T10:00:00Z',
    updatedAt: '2024-01-05T11:30:00Z',
  },
  {
    id: 'acc-008',
    name: 'Gerald Eve',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.geraldeve.com',
    phone: '+44 20 7333 6666',
    address: '72 Welbeck Street',
    city: 'London',
    postcode: 'W1G 0AY',
    country: 'United Kingdom',
    employeeCount: 500,
    contactCount: 3,
    activeDeals: 1,
    totalDeals: 4,
    relationshipHealth: 'good',
    lastActivity: '2024-01-11T10:00:00Z',
    createdAt: '2023-07-10T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
  },
  {
    id: 'acc-009',
    name: 'Instant Group',
    type: 'Brokerage',
    industry: 'Flexible Workspace',
    website: 'https://www.theinstantgroup.com',
    phone: '+44 20 7298 0600',
    address: '27 Soho Square',
    city: 'London',
    postcode: 'W1D 3AY',
    country: 'United Kingdom',
    employeeCount: 350,
    contactCount: 7,
    activeDeals: 3,
    totalDeals: 15,
    relationshipHealth: 'excellent',
    lastActivity: '2024-01-14T15:30:00Z',
    createdAt: '2023-02-28T10:00:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
  },
  {
    id: 'acc-010',
    name: 'TechStartup Ltd',
    type: 'Tenant',
    industry: 'Technology',
    website: 'https://www.techstartup.com',
    phone: '+44 20 1234 5678',
    city: 'London',
    postcode: 'EC1V 9NR',
    country: 'United Kingdom',
    employeeCount: 45,
    contactCount: 2,
    activeDeals: 1,
    totalDeals: 1,
    relationshipHealth: 'good',
    lastActivity: '2024-01-15T08:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'acc-011',
    name: 'Premier Cleaning Services',
    type: 'Supplier',
    industry: 'Facilities Management',
    website: 'https://www.premier-cs.com',
    phone: '+44 20 7946 0123',
    city: 'London',
    postcode: 'E14 5AB',
    country: 'United Kingdom',
    employeeCount: 120,
    contactCount: 2,
    activeDeals: 0,
    totalDeals: 0,
    relationshipHealth: 'good',
    lastActivity: '2024-01-14T09:15:00Z',
    createdAt: '2023-08-10T10:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'acc-012',
    name: 'Green Interior Plants',
    type: 'Supplier',
    industry: 'Interior Design',
    website: 'https://www.greenplants.co.uk',
    phone: '+44 20 7946 0456',
    city: 'London',
    postcode: 'N1 6DL',
    country: 'United Kingdom',
    employeeCount: 25,
    contactCount: 1,
    activeDeals: 0,
    totalDeals: 0,
    relationshipHealth: 'fair',
    lastActivity: '2024-01-12T11:30:00Z',
    createdAt: '2023-09-15T10:00:00Z',
    updatedAt: '2024-01-12T11:30:00Z',
  },
  {
    id: 'acc-013',
    name: 'Newmark',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.nmrk.com',
    phone: '+44 20 7290 6000',
    address: '40 Gracechurch Street',
    city: 'London',
    postcode: 'EC3V 0BT',
    country: 'United Kingdom',
    employeeCount: 800,
    contactCount: 2,
    activeDeals: 1,
    totalDeals: 3,
    relationshipHealth: 'fair',
    lastActivity: '2024-01-06T13:00:00Z',
    createdAt: '2023-08-01T10:00:00Z',
    updatedAt: '2024-01-06T13:00:00Z',
  },
  {
    id: 'acc-014',
    name: 'Avison Young',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.avisonyoung.co.uk',
    phone: '+44 20 7911 2468',
    address: '65 Gresham Street',
    city: 'London',
    postcode: 'EC2V 7NQ',
    country: 'United Kingdom',
    employeeCount: 600,
    contactCount: 3,
    activeDeals: 0,
    totalDeals: 2,
    relationshipHealth: 'fair',
    lastActivity: '2024-01-04T10:30:00Z',
    createdAt: '2023-09-10T10:00:00Z',
    updatedAt: '2024-01-04T10:30:00Z',
  },
  {
    id: 'acc-015',
    name: 'DeVono Cresa',
    type: 'Brokerage',
    industry: 'Real Estate',
    website: 'https://www.devonocresa.com',
    phone: '+44 20 7099 5555',
    address: '10 King William Street',
    city: 'London',
    postcode: 'EC4N 7TW',
    country: 'United Kingdom',
    employeeCount: 150,
    contactCount: 4,
    activeDeals: 2,
    totalDeals: 7,
    relationshipHealth: 'good',
    lastActivity: '2024-01-13T09:45:00Z',
    createdAt: '2023-04-25T10:00:00Z',
    updatedAt: '2024-01-13T09:45:00Z',
  },
];

function getAccounts(params: URLSearchParams): CompanyListResponse {
  let filtered = [...mockCompanies];
  const query = params.get('search');
  const type = params.get('type');
  const page = parseInt(params.get('page') || '1');
  const pageSize = parseInt(params.get('pageSize') || '50');

  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
    );
  }

  // Filter by type
  if (type) {
    filtered = filtered.filter((c) => c.type === type);
  }

  // Sort alphabetically by name
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // Paginate
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
    moreRecords: end < filtered.length,
  };
}

// Check if we're in local development mode (no real API available)
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const accountsHandlers = [
  http.get('/api/accounts', ({ request }) => {
    if (isLocalDev) {
      // Return mock data for local development
      const url = new URL(request.url);
      const response = getAccounts(url.searchParams);
      return HttpResponse.json(response);
    }
    // Pass through to the real API when deployed (Zoho CRM via Vercel functions)
    return passthrough();
  }),

  http.get('/api/accounts/:id', ({ params }) => {
    if (isLocalDev) {
      // Return mock data for local development
      const company = mockCompanies.find((c) => c.id === params.id);
      if (!company) {
        return HttpResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      return HttpResponse.json(company);
    }
    // Pass through to the real API when deployed
    return passthrough();
  }),

  http.post('/api/accounts', async ({ request }) => {
    if (isLocalDev) {
      // Handle mock creation for local development
      const body = (await request.json()) as Partial<Company>;
      const newCompany: Company = {
        id: `acc-${String(mockCompanies.length + 1).padStart(3, '0')}`,
        name: body.name || '',
        type: body.type || null,
        industry: body.industry || null,
        website: body.website || null,
        phone: body.phone || null,
        city: body.city || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCompanies.push(newCompany);
      return HttpResponse.json(newCompany, { status: 201 });
    }
    // Pass through to the real API when deployed
    return passthrough();
  }),

  http.put('/api/accounts/:id', () => {
    // Pass through to the real API to update account in Zoho CRM
    return passthrough();
  }),

  http.delete('/api/accounts/:id', () => {
    // Pass through to the real API to delete account in Zoho CRM
    return passthrough();
  }),
];
