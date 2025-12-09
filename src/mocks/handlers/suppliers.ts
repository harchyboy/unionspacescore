import { http, HttpResponse } from 'msw';
import type { Supplier, WorkOrder, SupplierActivity, SupplierCommunication, SupplierPerformance } from '../../types/supplier';

// Mock supplier data based on HTML prototype
const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Thirdway AV Solutions',
    initials: 'TW',
    category: 'AV & IT',
    coverage: ['City Core', 'Shoreditch', 'Canary Wharf', 'Mayfair'],
    openWorkOrders: 3,
    slaPercentage: 96,
    contractStatus: 'Active',
    lastJobAt: '2 hours ago',
    rating: 4.2,
    description: 'Premium AV and IT solutions provider covering Central London',
    hours: '24/7',
    baseRate: 65,
    callOutFee: 85,
    leadTimes: '2-4 hours response, 24h resolution',
    responseTimeTarget: 4,
    resolutionTimeTarget: 24,
    contacts: [
      {
        id: 'contact-1',
        name: 'Ben Carter',
        role: 'Account Manager',
        email: 'ben.carter@thirdway.co.uk',
        phone: '020 7946 0958',
        mobile: '+44 7700 900123',
        isPrimary: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      },
      {
        id: 'contact-2',
        name: 'Sarah Miller',
        role: 'Lead Technician',
        email: 'sarah.miller@thirdway.co.uk',
        phone: '020 7946 0959',
        mobile: '+44 7700 900124',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
      },
      {
        id: 'contact-3',
        name: 'James Foster',
        role: 'Operations Director',
        email: 'james.foster@thirdway.co.uk',
        phone: '020 7946 0500',
        mobile: '+44 7700 900100',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
      },
    ],
    contracts: [
      {
        id: 'contract-1',
        name: 'Master Service Agreement',
        type: 'Master Service Agreement',
        status: 'Active',
        value: '£48,000/year',
        startDate: '01 Jan 2024',
        renewalDate: '31 Dec 2024',
        noticePeriod: '90 days',
      },
      {
        id: 'contract-2',
        name: 'SLA Agreement',
        type: 'SLA Agreement',
        status: 'Active',
        responseTarget: '4 hours',
        resolutionTarget: '24 hours',
        criticalResponse: '1 hour response',
        uptimeGuarantee: '99.5%',
      },
    ],
    documents: [
      { id: 'doc-1', name: 'Master_Service_Agreement_2024.pdf', type: 'pdf', uploadedAt: '6 months ago' },
      { id: 'doc-2', name: 'SLA_Terms_2024.pdf', type: 'pdf', uploadedAt: '6 months ago' },
      { id: 'doc-3', name: 'Insurance_Certificate_2024.pdf', type: 'pdf', uploadedAt: '2 months ago' },
      { id: 'doc-4', name: 'RAMS_Documentation.pdf', type: 'pdf', uploadedAt: '3 months ago' },
    ],
    complianceStatus: 'Current',
    specialArrangement: 'AV services for meeting rooms are provided under a separate direct contract between UNION and Thirdway, not passed through to individual tenants. This arrangement offers better rates and simplified billing.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z',
  },
  {
    id: 'sup-2',
    name: 'Premier Cleaning Services',
    initials: 'PC',
    category: 'Cleaning',
    coverage: ['All London'],
    openWorkOrders: 0,
    slaPercentage: 98,
    contractStatus: 'Active',
    lastJobAt: '1 day ago',
    rating: 4.8,
    hours: 'Mon-Sat 6am-10pm',
    baseRate: 25,
    callOutFee: 50,
    contacts: [
      {
        id: 'contact-4',
        name: 'Sarah Mitchell',
        role: 'Operations Manager',
        email: 'sarah.mitchell@premierclean.co.uk',
        phone: '020 7946 0123',
        isPrimary: true,
      },
    ],
    complianceStatus: 'Current',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-11-28T09:15:00Z',
  },
  {
    id: 'sup-3',
    name: 'Urban Facilities Management',
    initials: 'UF',
    category: 'R&M',
    coverage: ['City Core', 'Canary Wharf'],
    openWorkOrders: 5,
    slaPercentage: 72,
    contractStatus: 'Active',
    lastJobAt: '3 hours ago',
    rating: 3.2,
    hours: '24/7',
    baseRate: 55,
    callOutFee: 95,
    contacts: [
      {
        id: 'contact-5',
        name: 'James Wilson',
        role: 'Account Director',
        email: 'james.wilson@urbanfm.co.uk',
        phone: '020 7946 0789',
        isPrimary: true,
      },
    ],
    complianceStatus: 'Expiring',
    complianceNote: 'Insurance expires in 14 days',
    createdAt: '2023-09-15T10:00:00Z',
    updatedAt: '2024-12-05T11:20:00Z',
  },
  {
    id: 'sup-4',
    name: 'Green Interior Plants',
    initials: 'GI',
    category: 'Plants',
    coverage: ['All London'],
    openWorkOrders: 1,
    slaPercentage: 94,
    contractStatus: 'Trial',
    lastJobAt: '2 days ago',
    rating: 4.4,
    hours: 'Mon-Fri 8am-5pm',
    baseRate: 35,
    contacts: [
      {
        id: 'contact-6',
        name: 'Emma Thompson',
        role: 'Client Manager',
        email: 'emma.thompson@greenplants.co.uk',
        phone: '020 7946 0456',
        isPrimary: true,
      },
    ],
    complianceStatus: 'Pending',
    complianceNote: 'RAMS documentation pending',
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-12-03T16:45:00Z',
  },
  {
    id: 'sup-5',
    name: 'Bespoke Coffee Co',
    initials: 'BC',
    category: 'Coffee',
    coverage: ['City Core', 'Shoreditch', 'Mayfair'],
    openWorkOrders: 2,
    slaPercentage: 91,
    contractStatus: 'Active',
    lastJobAt: '4 days ago',
    rating: 4.6,
    hours: 'Mon-Fri 7am-6pm',
    baseRate: 40,
    contacts: [
      {
        id: 'contact-7',
        name: 'Oliver Davies',
        role: 'Account Manager',
        email: 'oliver.davies@bespokecoffee.co.uk',
        phone: '020 7946 0321',
        isPrimary: true,
      },
    ],
    complianceStatus: 'Current',
    createdAt: '2023-03-20T10:00:00Z',
    updatedAt: '2024-11-30T10:00:00Z',
  },
  {
    id: 'sup-6',
    name: 'Smart Furniture Solutions',
    initials: 'SF',
    category: 'Furniture',
    coverage: ['All London'],
    openWorkOrders: 0,
    slaPercentage: 88,
    contractStatus: 'Active',
    lastJobAt: '1 week ago',
    rating: 4.1,
    hours: 'Mon-Fri 9am-5pm',
    baseRate: 50,
    callOutFee: 100,
    contacts: [
      {
        id: 'contact-8',
        name: 'Lucy Anderson',
        role: 'Project Manager',
        email: 'lucy.anderson@smartfurniture.co.uk',
        phone: '020 7946 0654',
        isPrimary: true,
      },
    ],
    complianceStatus: 'Current',
    createdAt: '2023-08-10T10:00:00Z',
    updatedAt: '2024-12-01T08:30:00Z',
  },
  {
    id: 'sup-7',
    name: 'City Energy Utilities',
    initials: 'CE',
    category: 'Utilities',
    coverage: ['All London'],
    openWorkOrders: 0,
    slaPercentage: 100,
    contractStatus: 'Active',
    lastJobAt: '5 days ago',
    rating: 4.9,
    hours: '24/7',
    contacts: [
      {
        id: 'contact-9',
        name: 'Michael Brown',
        role: 'Account Executive',
        email: 'michael.brown@cityenergy.co.uk',
        phone: '020 7946 0987',
        isPrimary: true,
      },
    ],
    complianceStatus: 'Current',
    createdAt: '2022-01-05T10:00:00Z',
    updatedAt: '2024-12-04T12:00:00Z',
  },
  {
    id: 'sup-8',
    name: 'TechSupport IT Services',
    initials: 'TS',
    category: 'AV & IT',
    coverage: ['Shoreditch', 'Mayfair'],
    openWorkOrders: 1,
    slaPercentage: 85,
    contractStatus: 'Trial',
    lastJobAt: '6 hours ago',
    rating: 3.8,
    hours: 'Mon-Fri 8am-8pm',
    baseRate: 55,
    callOutFee: 75,
    contacts: [
      {
        id: 'contact-10',
        name: 'Rachel Green',
        role: 'Service Manager',
        email: 'rachel.green@techsupport.co.uk',
        phone: '020 7946 0234',
        isPrimary: true,
      },
    ],
    complianceStatus: 'Current',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-12-09T06:30:00Z',
  },
];

// Mock work orders for supplier detail
const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-1',
    number: 'WO-2024-0847',
    supplierId: 'sup-1',
    property: '99 Bishopsgate',
    unit: 'Floor 3, Suite 301',
    description: 'Video conferencing setup',
    details: 'Install dual screens + camera',
    status: 'In Progress',
    slaTimeLeft: '1.2h left',
    slaPercentUsed: 65,
    assignedTo: {
      id: 'contact-1',
      name: 'Ben Clarke',
      role: 'Account Manager',
      email: 'ben.clarke@thirdway.co.uk',
      phone: '',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    },
    attachments: 3,
    createdAt: '2 days ago',
  },
  {
    id: 'wo-2',
    number: 'WO-2024-0846',
    supplierId: 'sup-1',
    property: 'Principal Place',
    unit: 'Floor 8, Suite 802',
    description: 'Network port activation',
    details: 'Enable 12 additional ports',
    status: 'Scheduled',
    slaTimeLeft: '4.8h left',
    slaPercentUsed: 30,
    assignedTo: {
      id: 'contact-2',
      name: 'Sarah Miller',
      role: 'Lead Technician',
      email: 'sarah.miller@thirdway.co.uk',
      phone: '',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    },
    attachments: 1,
    createdAt: '3 days ago',
  },
  {
    id: 'wo-3',
    number: 'WO-2024-0843',
    supplierId: 'sup-1',
    property: 'One Canada Square',
    unit: 'Floor 12, Suite 1205',
    description: 'Projector maintenance',
    details: 'Lamp replacement + calibration',
    status: 'Awaiting Parts',
    slaTimeLeft: '0.3h left',
    slaPercentUsed: 95,
    assignedTo: {
      id: 'contact-1',
      name: 'Ben Clarke',
      role: 'Account Manager',
      email: 'ben.clarke@thirdway.co.uk',
      phone: '',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    },
    attachments: 2,
    createdAt: '5 days ago',
  },
  {
    id: 'wo-4',
    number: 'WO-2024-0841',
    supplierId: 'sup-1',
    property: '99 Bishopsgate',
    unit: 'Floor 5, Suite 504',
    description: 'Wi-Fi coverage extension',
    details: 'Add 4 access points',
    status: 'Completed',
    assignedTo: {
      id: 'contact-2',
      name: 'Sarah Miller',
      role: 'Lead Technician',
      email: 'sarah.miller@thirdway.co.uk',
      phone: '',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    },
    attachments: 5,
    createdAt: '1 week ago',
  },
  {
    id: 'wo-5',
    number: 'WO-2024-0839',
    supplierId: 'sup-1',
    property: 'Principal Place',
    unit: 'Floor 6, Meeting Room B',
    description: 'AV system troubleshooting',
    details: 'Audio feedback issue',
    status: 'Completed',
    assignedTo: {
      id: 'contact-1',
      name: 'Ben Clarke',
      role: 'Account Manager',
      email: 'ben.clarke@thirdway.co.uk',
      phone: '',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    },
    attachments: 2,
    createdAt: '1 week ago',
  },
];

// Mock activity data
const mockActivity: SupplierActivity[] = [
  {
    id: 'act-1',
    type: 'work_order',
    title: 'Work order completed',
    description: 'Thirdway AV Solutions completed AV setup at 99 Bishopsgate',
    timestamp: '2 hours ago',
    icon: 'fa-wrench',
    iconBg: 'bg-primary',
  },
  {
    id: 'act-2',
    type: 'sla_breach',
    title: 'SLA breach detected',
    description: 'Urban Facilities Management exceeded response time on ticket #1247',
    timestamp: '3 hours ago',
    icon: 'fa-triangle-exclamation',
    iconBg: 'bg-destructive',
  },
  {
    id: 'act-3',
    type: 'compliance',
    title: 'Compliance docs updated',
    description: 'Premier Cleaning Services uploaded new insurance certificate',
    timestamp: '1 day ago',
    icon: 'fa-file-circle-check',
    iconBg: 'bg-primary',
  },
  {
    id: 'act-4',
    type: 'onboarding',
    title: 'New supplier onboarded',
    description: 'TechSupport IT Services added to supplier roster',
    timestamp: '2 days ago',
    icon: 'fa-plus',
    iconBg: 'bg-primary',
  },
  {
    id: 'act-5',
    type: 'contract',
    title: 'Contract renewed',
    description: 'Bespoke Coffee Co contract extended for 12 months',
    timestamp: '3 days ago',
    icon: 'fa-handshake',
    iconBg: 'bg-primary',
  },
];

// Mock communications data
const mockCommunications: SupplierCommunication[] = [
  {
    id: 'comm-1',
    type: 'email',
    senderName: 'Ben Clarke',
    senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    subject: 'Re: WO-2024-0847 - Video conferencing setup update',
    content: "Hi Dani, just confirming that we'll be on-site tomorrow at 10am to complete the video conferencing installation. The dual screens and camera have arrived and tested. Should take about 2 hours. Let me know if you need anything else.",
    timestamp: '2 hours ago',
    attachments: 2,
  },
  {
    id: 'comm-2',
    type: 'ticket',
    senderName: 'Dani Martinez',
    senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    subject: 'Ticket #3847 - Network port activation request',
    content: 'New request for Principal Place, Floor 8. Tenant needs 12 additional network ports activated by end of week. Please confirm availability and schedule.',
    timestamp: '1 day ago',
    status: 'Scheduled',
  },
  {
    id: 'comm-3',
    type: 'phone',
    senderName: 'Sarah Miller',
    senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    subject: 'Call log: WO-2024-0843 parts delay discussion',
    content: 'Discussed projector lamp delay. Supplier shipment delayed by 2 days. Agreed to prioritize delivery and extend SLA accordingly. Customer notified and accepted revised timeline.',
    timestamp: '3 days ago',
  },
  {
    id: 'comm-4',
    type: 'email',
    senderName: 'Ben Clarke',
    senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    subject: 'Monthly Performance Review - November 2024',
    content: 'Attached is our monthly performance summary. Overall SLA compliance at 92%, with 3 minor breaches (all resolved within extended timeframes). Looking forward to our quarterly business review next month.',
    timestamp: '1 week ago',
    attachments: 1,
  },
  {
    id: 'comm-5',
    type: 'meeting',
    senderName: 'Dani Martinez',
    senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    subject: 'Quarterly Business Review - Q4 2024',
    content: 'Reviewed Q4 performance, discussed upcoming projects for 99 Bishopsgate expansion. Agreed on new SLA targets for 2025. Action items: review rate card for new services, schedule training session for UNION ops team.',
    timestamp: '2 weeks ago',
  },
];

// Mock performance data
const mockPerformance: SupplierPerformance = {
  activeWorkOrders: 8,
  dueThisWeek: 3,
  avgResponseTime: '2.4h',
  responseTarget: '4h',
  onTimeCompletion: 92,
  onTimeChange: '+5% vs last month',
  contractValue: '£48k',
  contractPeriod: 'Annual commitment',
  onTimeDelivery: 92,
  firstTimeFixRate: 88,
  customerSatisfaction: 4.2,
  propertyPerformance: [
    { property: '99 Bishopsgate', workOrders: 24, onTimePercent: 95, firstFixPercent: 90, avgResponse: '2.1h', totalCost: '£18,400', rating: 4.5 },
    { property: 'Principal Place', workOrders: 18, onTimePercent: 89, firstFixPercent: 85, avgResponse: '2.6h', totalCost: '£14,200', rating: 4.1 },
    { property: 'One Canada Square', workOrders: 15, onTimePercent: 93, firstFixPercent: 87, avgResponse: '2.3h', totalCost: '£15,600', rating: 4.3 },
  ],
};

export const suppliersHandlers = [
  // GET /api/suppliers - List suppliers
  http.get('/api/suppliers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const query = url.searchParams.get('query');

    let filtered = [...mockSuppliers];

    // Apply filters
    if (category && category !== 'all') {
      filtered = filtered.filter((s) => s.category === category);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((s) => s.contractStatus === status);
    }
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQuery) ||
          s.category.toLowerCase().includes(lowerQuery) ||
          s.contacts.some((c) => c.name.toLowerCase().includes(lowerQuery))
      );
    }

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return HttpResponse.json({
      items,
      total: filtered.length,
      page,
      pageSize,
    });
  }),

  // GET /api/suppliers/:id - Get single supplier
  http.get('/api/suppliers/:id', ({ params }) => {
    const supplier = mockSuppliers.find((s) => s.id === params.id);
    if (!supplier) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(supplier);
  }),

  // GET /api/suppliers/:id/work-orders - Get supplier work orders
  http.get('/api/suppliers/:id/work-orders', ({ params }) => {
    const workOrders = mockWorkOrders.filter((wo) => wo.supplierId === params.id);
    return HttpResponse.json(workOrders);
  }),

  // GET /api/suppliers/:id/performance - Get supplier performance
  http.get('/api/suppliers/:id/performance', () => {
    return HttpResponse.json(mockPerformance);
  }),

  // GET /api/suppliers/:id/activity - Get supplier activity
  http.get('/api/suppliers/:id/activity', () => {
    return HttpResponse.json(mockActivity);
  }),

  // GET /api/suppliers/:id/communications - Get supplier communications
  http.get('/api/suppliers/:id/communications', () => {
    return HttpResponse.json(mockCommunications);
  }),
];

