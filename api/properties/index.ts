import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface Property {
  id: string;
  name: string;
  addressLine?: string;
  postcode?: string;
  city?: string;
  country?: string;
  geo?: { lat: number; lng: number };
  submarket?: string;
  totalSizeSqFt?: number;
  floorCount?: number;
  lifts?: string;
  builtYear?: number;
  refurbishedYear?: number;
  parking?: string;
  amenities?: string[];
  marketing?: {
    visibility?: string;
    status?: string;
    fitOut?: string;
  };
  compliance?: {
    epc?: { rating?: string; ref?: string; issued?: string; expires?: string };
    hsCertified?: boolean;
    breeam?: string;
  };
  contacts?: Record<string, unknown>;
  units?: Array<Record<string, unknown>>;
  stats?: {
    occupancyPct?: number;
    totalUnits?: number;
    available?: number;
    underOffer?: number;
    let?: number;
  };
  updatedAt?: string;
  [key: string]: unknown;
}

// Seed data - Fallback if Zoho connection fails
const seedProperties: Property[] = [
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
      fitOut: 'Fitted',
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
        fitOut: 'Fitted',
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
        fitOut: 'Fitted',
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
        fitOut: 'Part Fitted',
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
      fitOut: 'Unfitted',
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
      fitOut: 'Part Fitted',
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

// Helper to map Zoho response to Property interface
function mapZohoProperty(zohoProp: Record<string, unknown>): Property {
  return {
    id: (zohoProp.ID as string) || (zohoProp.id as string) || `zoho-${Math.random()}`,
    name: (zohoProp.Property_Name as string) || (zohoProp.name as string) || 'Unnamed Property',
    addressLine: (zohoProp.Address as string) || (zohoProp.addressLine as string) || '',
    postcode: (zohoProp.Postcode as string) || (zohoProp.postcode as string) || '',
    city: (zohoProp.City as string) || (zohoProp.city as string) || '',
    country: (zohoProp.Country as string) || (zohoProp.country as string) || 'United Kingdom',
    // Map other fields as needed from your Zoho response structure
    marketing: {
      status: (zohoProp.Status as string) || 'Draft',
      visibility: 'Private', // Default to private if not in Zoho
    },
    updatedAt: new Date().toISOString(),
    // Keep original data for debugging
    _zohoRaw: zohoProp
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { id } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  let properties: Property[] = [];
  let zohoError = null;

  // 1. Try to fetch from Zoho
  try {
    const ZOHO_PUBLIC_KEY = process.env.ZOHO_PUBLIC_KEY;
    const ZOHO_GET_PROPERTIES_URL = process.env.ZOHO_GET_PROPERTIES_URL;

    if (ZOHO_PUBLIC_KEY && ZOHO_GET_PROPERTIES_URL) {
      // Append public key to URL
      const url = `${ZOHO_GET_PROPERTIES_URL}?publickey=${ZOHO_PUBLIC_KEY}`;
      
      // Call Zoho Custom API (GET or POST depending on how you set it up)
      // Using POST as standard practice for Zoho Creator custom APIs passing JSON
      const response = await axios.post(url, {}); 
      
      if (response.data && (response.data.code === 3000 || response.data.result)) {
        // Zoho custom APIs usually return data in 'result' or directly
        const rawData = response.data.result || response.data;
        
        if (Array.isArray(rawData)) {
          properties = rawData.map(mapZohoProperty);
        } else if (typeof rawData === 'object') {
           // Handle case where it returns a single object or map
           properties = Object.values(rawData).map(mapZohoProperty);
        }
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching from Zoho:', errorMessage);
    zohoError = errorMessage;
  }

  // 2. Fallback to seed data if Zoho failed or returned no data
  if (properties.length === 0) {
    console.log('Using seed data (Zoho fetch failed or empty)');
    properties = [...seedProperties];
  }

  // GET /api/properties - List properties
  if (method === 'GET' && !id) {
    const search = (req.query.search as string)?.toLowerCase() || '';
    const marketingStatus = (req.query.marketingStatus as string) || '';
    const visibility = (req.query.visibility as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const sortBy = (req.query.sortBy as string) || 'updatedAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const filtered = properties.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search) && (!p.addressLine || !p.addressLine.toLowerCase().includes(search))) {
        return false;
      }
      if (marketingStatus && p.marketing?.status !== marketingStatus) {
        return false;
      }
      if (visibility && p.marketing?.visibility !== visibility) {
        return false;
      }
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

    return res.status(200).json({
      properties: paginated,
      total: filtered.length,
      page,
      limit,
      source: zohoError ? 'local_seed' : 'zoho_live', // Debug info
    });
  }

  // GET /api/properties/:id - Get property by ID
  if (method === 'GET' && id) {
    const property = properties.find((p) => p.id === id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    return res.status(200).json(property);
  }

  // POST /api/properties - Create property
  // Note: Ideally this should write to Zoho too!
  if (method === 'POST') {
    const payload = req.body as Partial<Property>;
    // ... (Keep existing mock create logic for now, or implement Zoho Create)
    const newProperty: Property = {
      id: `property-${Date.now()}`,
      name: payload.name || 'Unnamed Property',
      // ... defaults ...
      updatedAt: new Date().toISOString(),
      ...payload,
    } as Property;
    
    return res.status(201).json(newProperty);
  }

  // PATCH /api/properties/:id - Update property
  if (method === 'PATCH' && id) {
    // ... (Keep existing mock update logic)
    return res.status(200).json({ message: "Update simulated" });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
