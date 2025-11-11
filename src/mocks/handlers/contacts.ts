import { http, HttpResponse } from 'msw';
import type { Contact, ContactListResponse } from '../../types/contact';

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'James',
    lastName: 'Parker',
    fullName: 'James Parker',
    email: 'j.parker@knightfrank.com',
    phone: '+44 20 7629 8171',
    company: 'Knight Frank',
    type: 'flex-broker',
    role: 'Senior Partner',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    territory: 'Central London',
    submarkets: ['City Core', 'Shoreditch'],
    specialisms: ['Tech Sector', 'Scale-ups', '10-50 desks'],
    relationshipHealth: 'excellent',
    relationshipHealthScore: 92,
    lastActivity: '2 hours ago',
    lastContacted: '2024-01-15T10:30:00Z',
    openDeals: 3,
    openViewings: 2,
    totalDeals: 12,
    totalViewings: 8,
    notes: 'Key broker contact specializing in tech scale-ups.',
    commsPreferences: {
      email: true,
      phone: true,
      sms: false,
      preferredMethod: 'email',
    },
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Marcus',
    lastName: 'Reynolds',
    fullName: 'Marcus Reynolds',
    email: 'marcus.reynolds@savills.com',
    phone: '+44 20 7409 8756',
    mobile: '+44 7700 900 123',
    company: 'Savills',
    type: 'flex-broker',
    role: 'Senior Partner, Flexible Office Solutions',
    territory: 'Central London, City Core',
    submarkets: ['City Core', 'Shoreditch', 'Clerkenwell'],
    specialisms: ['Tech Sector', 'Scale-ups', '10-50 desks'],
    preferredSubmarkets: ['City Core', 'Shoreditch', 'Clerkenwell'],
    referralSource: 'Industry Event - PropTech Summit 2023',
    commissionStructure: 'Standard - 10% first year rent',
    relationshipHealth: 'excellent',
    relationshipHealthScore: 85,
    lastActivity: '2 days ago',
    lastContacted: '2024-01-13T14:20:00Z',
    openDeals: 5,
    openViewings: 3,
    totalDeals: 18,
    totalViewings: 12,
    notes: 'Marcus is a key broker contact specializing in tech scale-ups. Many of his requirements are confidential until later stages. Prefers email communication over calls.',
    commsPreferences: {
      email: true,
      phone: false,
      sms: false,
      preferredMethod: 'email',
    },
    createdAt: '2023-05-20T10:00:00Z',
    updatedAt: '2024-01-13T14:20:00Z',
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    fullName: 'Sarah Mitchell',
    email: 'sarah@premier-cs.com',
    phone: '+44 20 7946 0123',
    company: 'Premier Cleaning Services',
    type: 'supplier',
    role: 'Account Manager',
    relationshipHealth: 'good',
    relationshipHealthScore: 78,
    lastActivity: '1 day ago',
    lastContacted: '2024-01-14T09:15:00Z',
    openDeals: 0,
    openViewings: 0,
    totalDeals: 0,
    totalViewings: 0,
    createdAt: '2023-08-10T10:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Chen',
    fullName: 'David Chen',
    email: 'david.chen@techstartup.com',
    phone: '+44 20 1234 5678',
    company: 'TechStartup Ltd',
    type: 'tenant',
    role: 'CEO',
    relationshipHealth: 'good',
    relationshipHealthScore: 82,
    lastActivity: '5 hours ago',
    lastContacted: '2024-01-15T08:00:00Z',
    openDeals: 1,
    openViewings: 1,
    totalDeals: 1,
    totalViewings: 2,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    firstName: 'Emma',
    lastName: 'Thompson',
    fullName: 'Emma Thompson',
    email: 'emma@greenplants.co.uk',
    phone: '+44 20 7946 0456',
    company: 'Green Interior Plants',
    type: 'supplier',
    role: 'Business Development',
    relationshipHealth: 'fair',
    relationshipHealthScore: 65,
    lastActivity: '3 days ago',
    lastContacted: '2024-01-12T11:30:00Z',
    openDeals: 0,
    openViewings: 0,
    totalDeals: 0,
    totalViewings: 0,
    createdAt: '2023-09-15T10:00:00Z',
    updatedAt: '2024-01-12T11:30:00Z',
  },
];

function getContacts(params: URLSearchParams): ContactListResponse {
  let filtered = [...mockContacts];
  const query = params.get('query');
  const type = params.get('type');
  const company = params.get('company');
  const submarket = params.get('submarket');
  const health = params.get('health');
  const sortBy = params.get('sortBy') || 'name';
  const sortOrder = params.get('sortOrder') || 'asc';
  const page = parseInt(params.get('page') || '1');
  const pageSize = parseInt(params.get('pageSize') || '50');

  // Filter by query
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
    );
  }

  // Filter by type
  if (type && type !== 'all') {
    filtered = filtered.filter((c) => c.type === type);
  }

  // Filter by company
  if (company) {
    filtered = filtered.filter((c) => c.company === company);
  }

  // Filter by submarket
  if (submarket) {
    filtered = filtered.filter((c) => c.submarkets?.includes(submarket));
  }

  // Filter by health
  if (health && health !== 'all') {
    filtered = filtered.filter((c) => c.relationshipHealth === health);
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.fullName.localeCompare(b.fullName);
        break;
      case 'lastActivity':
        comparison =
          new Date(a.lastContacted || a.updatedAt).getTime() -
          new Date(b.lastContacted || b.updatedAt).getTime();
        break;
      case 'health':
        comparison = (a.relationshipHealthScore || 0) - (b.relationshipHealthScore || 0);
        break;
      case 'company':
        comparison = (a.company || '').localeCompare(b.company || '');
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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
  };
}

export const contactsHandlers = [
  http.get('/api/contacts', ({ request }) => {
    const url = new URL(request.url);
    const response = getContacts(url.searchParams);
    return HttpResponse.json(response);
  }),

  http.get('/api/contacts/:id', ({ params }) => {
    const contact = mockContacts.find((c) => c.id === params.id);
    if (!contact) {
      return HttpResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    return HttpResponse.json(contact);
  }),

  http.post('/api/contacts', async ({ request }) => {
    const body = (await request.json()) as Partial<Contact>;
    const newContact: Contact = {
      id: String(mockContacts.length + 1),
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email || '',
      phone: body.phone,
      mobile: body.mobile,
      company: body.company,
      type: body.type || 'internal',
      role: body.role,
      territory: body.territory,
      submarkets: body.submarkets,
      specialisms: body.specialisms,
      relationshipHealth: 'good',
      relationshipHealthScore: 70,
      openDeals: 0,
      openViewings: 0,
      totalDeals: 0,
      totalViewings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockContacts.push(newContact);
    return HttpResponse.json(newContact, { status: 201 });
  }),

  http.patch('/api/contacts/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Contact>;
    const index = mockContacts.findIndex((c) => c.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    const updated = {
      ...mockContacts[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    if (body.firstName || body.lastName) {
      updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
    }
    mockContacts[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete('/api/contacts/:id', ({ params }) => {
    const index = mockContacts.findIndex((c) => c.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    mockContacts.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),
];

