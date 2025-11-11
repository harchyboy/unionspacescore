// Mock data store for suppliers
const suppliersStore = [
  {
    id: '1',
    name: 'Thirdway AV Solutions',
    shortName: 'Thirdway AV',
    description: 'Audio-visual & tech solutions',
    category: 'AV & IT',
    status: 'active',
    sla: 96,
    coverage: ['City Core', 'Shoreditch'],
    primaryContact: { name: 'Ben Carter', email: 'ben@thirdway.co.uk', phone: '020 7946 0958' },
    renewalDate: '2025-12-15',
    workOrders: { open: 3, total: 24 },
    contractValue: 48000,
    lastJob: '2 hours ago',
    initials: 'TW',
    icon: 'fa-tv'
  },
  {
    id: '2',
    name: 'Premier Cleaning Services',
    shortName: 'Premier Cleaning',
    description: 'Commercial cleaning specialists',
    category: 'Cleaning',
    status: 'active',
    sla: 98,
    coverage: ['All London'],
    primaryContact: { name: 'Sarah Mitchell', email: 'sarah@premier-cs.com', phone: '020 7946 0123' },
    renewalDate: '2026-03-20',
    workOrders: { open: 0, total: 18 },
    contractValue: 36000,
    lastJob: '1 day ago',
    initials: 'PC',
    icon: 'fa-broom'
  },
  {
    id: '3',
    name: 'Urban Facilities Management',
    shortName: 'Urban Facilities',
    description: '24/7 repairs & maintenance',
    category: 'R&M',
    status: 'active',
    sla: 72,
    coverage: ['City Core', 'Canary Wharf'],
    primaryContact: { name: 'James Wilson', email: 'james@urbanfm.co.uk', phone: '020 7946 0789' },
    renewalDate: '2025-06-30',
    workOrders: { open: 5, total: 32 },
    contractValue: 72000,
    lastJob: '3 hours ago',
    initials: 'UF',
    icon: 'fa-wrench'
  },
  {
    id: '4',
    name: 'Green Interior Plants',
    shortName: 'Green Spaces',
    description: 'Office plants & landscaping',
    category: 'Plants',
    status: 'trial',
    sla: 94,
    coverage: ['All London'],
    primaryContact: { name: 'Emma Thompson', email: 'emma@greenplants.co.uk', phone: '020 7946 0456' },
    renewalDate: null,
    workOrders: { open: 1, total: 8 },
    contractValue: 12000,
    lastJob: '2 days ago',
    initials: 'GI',
    icon: 'fa-leaf'
  },
  {
    id: '5',
    name: 'Bespoke Coffee Co',
    shortName: 'Artisan Coffee',
    description: 'Premium coffee & pantry services',
    category: 'Coffee',
    status: 'active',
    sla: 91,
    coverage: ['City Core', 'Shoreditch', 'Mayfair'],
    primaryContact: { name: 'Oliver Davies', email: 'oliver@bespokecoffee.co.uk', phone: '020 7946 0321' },
    renewalDate: '2025-11-05',
    workOrders: { open: 2, total: 12 },
    contractValue: 24000,
    lastJob: '4 days ago',
    initials: 'BC',
    icon: 'fa-mug-hot'
  },
  {
    id: '6',
    name: 'Smart Furniture Solutions',
    shortName: 'Smart Furniture',
    description: 'Office furniture & fit-out',
    category: 'Furniture',
    status: 'active',
    sla: 88,
    coverage: ['All London'],
    primaryContact: { name: 'Lucy Anderson', email: 'lucy@smartfurniture.co.uk', phone: '020 7946 0654' },
    renewalDate: '2025-09-10',
    workOrders: { open: 0, total: 6 },
    contractValue: 18000,
    lastJob: '1 week ago',
    initials: 'SF',
    icon: 'fa-couch'
  },
  {
    id: '7',
    name: 'City Energy Utilities',
    shortName: 'City Energy',
    description: 'Utilities & energy management',
    category: 'Utilities',
    status: 'active',
    sla: 100,
    coverage: ['All London'],
    primaryContact: { name: 'Michael Brown', email: 'michael@cityenergy.co.uk', phone: '020 7946 0987' },
    renewalDate: '2025-12-31',
    workOrders: { open: 0, total: 4 },
    contractValue: 60000,
    lastJob: '5 days ago',
    initials: 'CE',
    icon: 'fa-bolt'
  },
  {
    id: '8',
    name: 'TechSupport IT Services',
    shortName: 'TechSupport Pro',
    description: 'IT infrastructure & support',
    category: 'AV & IT',
    status: 'trial',
    sla: 85,
    coverage: ['Shoreditch', 'Mayfair'],
    primaryContact: { name: 'Rachel Green', email: 'rachel@techsupport.com', phone: '020 7946 0234' },
    renewalDate: null,
    workOrders: { open: 1, total: 5 },
    contractValue: 30000,
    lastJob: '6 hours ago',
    initials: 'TS',
    icon: 'fa-laptop'
  }
];

// Data fetching functions
export async function listSuppliers({ query = '', filters = {}, sort = 'name', page = 1, pageSize = 50 }) {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  let filtered = [...suppliersStore];
  
  // Apply search query
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.primaryContact.name.toLowerCase().includes(q)
    );
  }
  
  // Apply filters
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(s => s.status === filters.status);
  }
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(s => s.category === filters.category);
  }
  if (filters.slaBand) {
    if (filters.slaBand === '95+') {
      filtered = filtered.filter(s => s.sla >= 95);
    } else if (filters.slaBand === '80-95') {
      filtered = filtered.filter(s => s.sla >= 80 && s.sla < 95);
    } else if (filters.slaBand === 'below-80') {
      filtered = filtered.filter(s => s.sla < 80);
    }
  }
  
  // Apply sorting
  if (sort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'sla') {
    filtered.sort((a, b) => b.sla - a.sla);
  } else if (sort === 'renewal') {
    filtered.sort((a, b) => {
      if (!a.renewalDate) return 1;
      if (!b.renewalDate) return -1;
      return new Date(a.renewalDate) - new Date(b.renewalDate);
    });
  }
  
  // Pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);
  
  return {
    items,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize)
  };
}

export async function getSupplierById(id) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return suppliersStore.find(s => s.id === id) || null;
}

export async function upsertSupplier(payload) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (payload.id) {
    // Update existing
    const index = suppliersStore.findIndex(s => s.id === payload.id);
    if (index >= 0) {
      suppliersStore[index] = { ...suppliersStore[index], ...payload };
      return suppliersStore[index];
    }
  } else {
    // Create new
    const newSupplier = {
      ...payload,
      id: String(suppliersStore.length + 1),
      initials: payload.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      workOrders: { open: 0, total: 0 },
      lastJob: 'Never'
    };
    suppliersStore.push(newSupplier);
    return newSupplier;
  }
  
  throw new Error('Supplier not found');
}

export async function deleteSupplier(id) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = suppliersStore.findIndex(s => s.id === id);
  if (index >= 0) {
    suppliersStore.splice(index, 1);
    return true;
  }
  throw new Error('Supplier not found');
}

// Export for use in HTML (non-module)
window.SuppliersData = { listSuppliers, getSupplierById, upsertSupplier, deleteSupplier };

