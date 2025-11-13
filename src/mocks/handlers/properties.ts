import { http, HttpResponse } from 'msw';
import type { Property } from '../../types/property';

// Seed data: 99 Bishopsgate example
export const seedProperties: Property[] = [
  {
    id: '99-bishopsgate',
    name: '99 Bishopsgate',
    addressLine: '99 Bishopsgate',
    postcode: 'EC2M 3XD',
    city: 'London',
    country: 'United Kingdom',
    geo: { lat: 51.5155, lng: -0.0815 },
    submarket: 'City of London',
    totalSizeSqFt: 45000,
    floorCount: 10,
    lifts: '2 passenger, 1 service',
    builtYear: 1985,
    refurbishedYear: 2020,
    parking: 'No parking',
    amenities: [
      'Reception',
      'Meeting rooms',
      'Kitchen facilities',
      'Bike storage',
      'Shower facilities',
      'Air conditioning',
    ],
    marketing: {
      visibility: 'Public',
      status: 'On Market',
      fitOut: 'Cat A+',
    },
    compliance: {
      epc: {
        rating: 'B',
        ref: 'EPC-99B-2024',
        issued: '2024-01-15',
        expires: '2034-01-15',
      },
      hsCertified: true,
      breeam: 'Excellent',
    },
    contacts: {
      agent: {
        name: 'Sarah Johnson',
        firm: 'Knight Frank',
        email: 'sarah.johnson@knightfrank.com',
        phone: '+44 20 7629 8171',
      },
      landlord: {
        name: 'British Land',
        pmContact: 'property.management@britishland.com',
      },
    },
    units: [
      {
        id: 'unit-1',
        code: '99B-3-A',
        floor: '3rd',
        sizeSqFt: 2500,
        desks: 12,
        fitOut: 'Cat A+',
        status: 'Available',
        pricePsf: 65,
        pricePcm: 13500,
        pipelineStage: 'New',
      },
      {
        id: 'unit-2',
        code: '99B-5-B',
        floor: '5th',
        sizeSqFt: 3200,
        desks: 16,
        fitOut: 'Cat A+',
        status: 'Under Offer',
        pricePsf: 68,
        pricePcm: 17400,
        pipelineStage: 'HoTs',
      },
      {
        id: 'unit-3',
        code: '99B-7-C',
        floor: '7th',
        sizeSqFt: 1800,
        desks: 9,
        fitOut: 'Cat A',
        status: 'Let',
        pricePsf: 60,
        pricePcm: 9000,
        lease: '5 year lease, break at year 3',
        pipelineStage: 'Closed',
      },
    ],
    stats: {
      occupancyPct: 33.3,
      totalUnits: 3,
      available: 1,
      underOffer: 1,
      let: 1,
    },
    updatedAt: '2024-12-15T10:30:00Z',
  },
  {
    id: 'sample-2',
    name: 'Sample Property 2',
    addressLine: '123 Main Street',
    postcode: 'SW1A 1AA',
    city: 'London',
    country: 'United Kingdom',
    amenities: ['Reception', 'Kitchen'],
    marketing: {
      visibility: 'Private',
      status: 'Draft',
      fitOut: 'Shell',
    },
    units: [],
    stats: {
      occupancyPct: 0,
      totalUnits: 0,
      available: 0,
      underOffer: 0,
      let: 0,
    },
    updatedAt: '2024-12-10T08:00:00Z',
  },
  {
    id: 'sample-3',
    name: 'Sample Property 3',
    addressLine: '456 High Street',
    postcode: 'W1K 6HR',
    city: 'London',
    country: 'United Kingdom',
    amenities: ['Reception'],
    marketing: {
      visibility: 'Public',
      status: 'Broker-Ready',
      fitOut: 'Cat A',
    },
    units: [],
    stats: {
      occupancyPct: 0,
      totalUnits: 0,
      available: 0,
      underOffer: 0,
      let: 0,
    },
    updatedAt: '2024-12-12T14:20:00Z',
  },
];

const properties = [...seedProperties];

export const propertyHandlers = [
  // List properties
  http.get('/api/properties', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const marketingStatus = url.searchParams.get('marketingStatus') || '';
    const visibility = url.searchParams.get('visibility') || '';
    const brokerSet = url.searchParams.get('brokerSet') || '';
    const missingMedia = url.searchParams.get('missingMedia') === 'true';
    const brokerReadyThisWeek = url.searchParams.get('brokerReadyThisWeek') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const sortBy = url.searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const filtered = properties.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search) && !p.addressLine.toLowerCase().includes(search)) {
        return false;
      }
      if (marketingStatus && p.marketing.status !== marketingStatus) {
        return false;
      }
      if (visibility && p.marketing.visibility !== visibility) {
        return false;
      }
      if (brokerSet && p.marketing.brokerSet !== brokerSet) {
        return false;
      }
      // Note: missingMedia and brokerReadyThisWeek would need additional property fields to filter properly
      // For now, we'll skip these filters in the mock
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | undefined;
      let bVal: string | number | undefined;

      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else {
        aVal = a.updatedAt || '';
        bVal = b.updatedAt || '';
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      properties: paginated,
      total: filtered.length,
      page,
      limit,
    });
  }),

  // Get property by ID
  http.get('/api/properties/:id', ({ params }) => {
    const { id } = params;
    const property = properties.find((p) => p.id === id);

    if (!property) {
      return HttpResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return HttpResponse.json(property);
  }),

  // Create property
  http.post('/api/properties', async ({ request }) => {
    const payload = (await request.json()) as Partial<Property>;
    const newProperty: Property = {
      id: `property-${Date.now()}`,
      name: payload.name || 'Unnamed Property',
      addressLine: payload.addressLine || '',
      postcode: payload.postcode || '',
      city: payload.city || '',
      country: payload.country || 'United Kingdom',
      amenities: payload.amenities || [],
      marketing: payload.marketing || {
        visibility: 'Private',
        status: 'Draft',
        fitOut: 'Shell',
      },
      units: payload.units || [],
      stats: {
        occupancyPct: 0,
        totalUnits: 0,
        available: 0,
        underOffer: 0,
        let: 0,
      },
      updatedAt: new Date().toISOString(),
      ...payload,
    };

    properties.push(newProperty);
    return HttpResponse.json(newProperty, { status: 201 });
  }),

  // Bulk update properties
  http.patch('/api/properties/bulk', async ({ request }) => {
    const body = (await request.json()) as {
      propertyIds: string[];
      updates: {
        visibility?: 'Private' | 'Public';
        marketingStatus?: 'Draft' | 'Broker-Ready' | 'On Market';
        brokerSet?: string;
      };
    };

    let updated = 0;
    const errors: string[] = [];

    for (const id of body.propertyIds) {
      const property = properties.find((p) => p.id === id);
      if (property) {
        if (body.updates.visibility) {
          property.marketing.visibility = body.updates.visibility;
        }
        if (body.updates.marketingStatus) {
          property.marketing.status = body.updates.marketingStatus;
        }
        if (body.updates.brokerSet !== undefined) {
          property.marketing.brokerSet = body.updates.brokerSet;
        }
        property.updatedAt = new Date().toISOString();
        updated++;
      } else {
        errors.push(`Property ${id} not found`);
      }
    }

    return HttpResponse.json({ success: true, updated, errors: errors.length > 0 ? errors : undefined });
  }),

  // Bulk push to broker set
  http.post('/api/properties/bulk/broker-set', async ({ request }) => {
    const body = (await request.json()) as {
      propertyIds: string[];
      brokerSet: string;
    };

    let updated = 0;
    const errors: string[] = [];

    for (const id of body.propertyIds) {
      const property = properties.find((p) => p.id === id);
      if (property) {
        property.marketing.brokerSet = body.brokerSet;
        property.updatedAt = new Date().toISOString();
        updated++;
      } else {
        errors.push(`Property ${id} not found`);
      }
    }

    return HttpResponse.json({ success: true, updated, errors: errors.length > 0 ? errors : undefined });
  }),

  // Update property
  http.patch('/api/properties/:id', async ({ params, request }) => {
    const { id } = params;
    const payload = (await request.json()) as Partial<Property>;
    const index = properties.findIndex((p) => p.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    properties[index] = {
      ...properties[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(properties[index]);
  }),

  // Upload document
  http.post('/api/properties/:id/documents', async ({ params, request }) => {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return HttpResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Mock response
    return HttpResponse.json({
      id: `doc-${Date.now()}`,
      url: `/documents/${id}/${file.name}`,
      name: file.name,
    });
  }),
];

