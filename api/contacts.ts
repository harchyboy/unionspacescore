import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ZohoContactRecord {
  id: string;
  First_Name?: string;
  Last_Name?: string;
  Full_Name?: string;
  Email?: string;
  Phone?: string;
  Mobile?: string;
  Title?: string;
  Department?: string;
  Account_Name?: { id?: string; name?: string };
  Mailing_Street?: string;
  Mailing_City?: string;
  Mailing_State?: string;
  Mailing_Zip?: string;
  Mailing_Country?: string;
  Description?: string;
  Lead_Source?: string;
  Modified_Time?: string;
  Created_Time?: string;
  // Custom fields for UNION
  Contact_Type?: string;
  Territory?: string;
  Relationship_Health?: string;
  Relationship_Health_Score?: number;
  [key: string]: unknown;
}

interface ContactDto {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  role?: string | null;
  company?: string | null;
  accountId?: string | null;
  type?: string | null;
  territory?: string | null;
  health?: string | null;
  relationshipHealthScore?: number | null;
  lastActivity?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const requiredEnvVars = ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'] as const;

function ensureEnv() {
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var ${key}`);
    }
  }
}

const ZOHO_DC = process.env.ZOHO_DC || 'eu';
const TOKEN_URL = `https://accounts.zoho.${ZOHO_DC}/oauth/v2/token`;
const API_BASE = `https://www.zohoapis.${ZOHO_DC}`;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken() {
  ensureEnv();
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    grant_type: 'refresh_token',
  });

  const response = await fetch(`${TOKEN_URL}?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoho OAuth error: ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

type FetchOptions = Parameters<typeof fetch>[1];

async function zohoRequest<T>(path: string, init: FetchOptions = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Zoho-oauthtoken ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  // Some Zoho endpoints can legitimately return 204 No Content
  if (response.status === 204) {
    return { data: [] } as T;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoho API error (${response.status}): ${text}`);
  }

  const text = await response.text();
  if (!text) {
    return { data: [] } as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response from Zoho: ${text.substring(0, 120)}...`);
  }
}

function mapContact(record: ZohoContactRecord): ContactDto {
  const firstName = record.First_Name || '';
  const lastName = record.Last_Name || '';
  const fullName = record.Full_Name || `${firstName} ${lastName}`.trim() || 'Unnamed Contact';
  
  return {
    id: record.id,
    firstName,
    lastName,
    name: fullName,
    email: record.Email || '',
    phone: record.Phone ?? null,
    mobile: record.Mobile ?? null,
    role: record.Title ?? null,
    company: record.Account_Name?.name ?? null,
    accountId: record.Account_Name?.id ?? null,
    type: record.Contact_Type ?? 'Broker',
    territory: record.Territory ?? record.Mailing_City ?? null,
    health: record.Relationship_Health ?? 'good',
    relationshipHealthScore: record.Relationship_Health_Score ?? null,
    lastActivity: record.Modified_Time ?? null,
    createdAt: record.Created_Time ?? null,
    updatedAt: record.Modified_Time ?? null,
  };
}

async function getTotalCount(typeFilter?: string, healthFilter?: string, query?: string, companyFilter?: string): Promise<number> {
  let total = 0;
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    let apiPath: string;
    const criteria = buildCriteria(typeFilter, healthFilter, query, companyFilter);
    
    if (criteria) {
      apiPath = `/crm/v2/Contacts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=200`;
    } else {
      apiPath = `/crm/v2/Contacts?page=${page}&per_page=200`;
    }
    
    const response = await zohoRequest<{
      data?: { id: string }[];
      info?: { more_records?: boolean };
    }>(apiPath);
    
    const count = response.data?.length ?? 0;
    total += count;
    hasMore = response.info?.more_records ?? false;
    page++;
    
    if (page > 50) break;
  }
  
  return total;
}

function buildCriteria(typeFilter?: string, healthFilter?: string, query?: string, companyFilter?: string): string | null {
  const conditions: string[] = [];
  
  if (typeFilter) {
    conditions.push(`(Contact_Type:equals:${typeFilter})`);
  }
  
  if (healthFilter) {
    conditions.push(`(Relationship_Health:equals:${healthFilter})`);
  }
  
  if (query && query.trim().length >= 2) {
    // Search by name or email
    conditions.push(`((Full_Name:contains:${query.trim()})or(Email:contains:${query.trim()}))`);
  }
  
  if (companyFilter) {
    // Filter by company name
    conditions.push(`(Account_Name:equals:${companyFilter})`);
  }
  
  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];
  
  return `(${conditions.join('and')})`;
}

async function listContacts(
  page = 1, 
  perPage = 50, 
  typeFilter?: string, 
  healthFilter?: string, 
  query?: string,
  companyFilter?: string,
  sortBy = 'name',
  sortOrder = 'asc'
) {
  let apiPath: string;
  const criteria = buildCriteria(typeFilter, healthFilter, query, companyFilter);
  
  // Map our sort field to Zoho field
  const zohoSortField = sortBy === 'name' ? 'Full_Name' : 
                        sortBy === 'lastActivity' ? 'Modified_Time' :
                        sortBy === 'company' ? 'Account_Name' : 'Full_Name';
  const zohoSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';
  
  if (criteria) {
    apiPath = `/crm/v2/Contacts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=${perPage}&sort_order=${zohoSortOrder}&sort_by=${zohoSortField}`;
  } else {
    apiPath = `/crm/v2/Contacts?page=${page}&per_page=${perPage}&sort_order=${zohoSortOrder}&sort_by=${zohoSortField}`;
  }

  const response = await zohoRequest<{
    data?: ZohoContactRecord[];
    info?: { more_records?: boolean; count?: number };
  }>(apiPath);

  const records = response.data ?? [];
  const moreRecords = response.info?.more_records ?? false;
  
  // Get accurate total count
  const total = await getTotalCount(typeFilter, healthFilter, query, companyFilter);

  return {
    items: records.map(mapContact),
    info: { count: total, more_records: moreRecords },
  };
}

async function createContact(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  accountId?: string;
  type?: string;
  role?: string;
  territory?: string;
  notes?: string;
}) {
  const body = {
    data: [
      {
        First_Name: payload.firstName,
        Last_Name: payload.lastName,
        Email: payload.email,
        Phone: payload.phone || undefined,
        Mobile: payload.mobile || undefined,
        Account_Name: payload.accountId ? { id: payload.accountId } : undefined,
        Contact_Type: payload.type || 'Broker',
        Title: payload.role || undefined,
        Territory: payload.territory || undefined,
        Description: payload.notes || undefined,
      },
    ],
    trigger: [],
  };

  const response = await zohoRequest<{
    data?: { details?: { id: string }; status?: string; message?: string }[];
  }>('/crm/v2/Contacts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const details = response.data?.[0];
  if (details?.status === 'error') {
    throw new Error(details.message || 'Failed to create contact in Zoho');
  }

  const id = details?.details?.id;
  if (!id) {
    throw new Error('Zoho did not return a Contact ID');
  }

  // Return a normalised DTO
  return mapContact({
    id,
    First_Name: payload.firstName,
    Last_Name: payload.lastName,
    Email: payload.email,
    Phone: payload.phone,
    Mobile: payload.mobile,
    Title: payload.role,
    Contact_Type: payload.type,
    Territory: payload.territory,
  });
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const page = parseNumber(req.query.page, 1);
      const pageSize = parseNumber(req.query.pageSize, 50);
      const typeFilter = typeof req.query.type === 'string' ? req.query.type : undefined;
      const healthFilter = typeof req.query.health === 'string' ? req.query.health : undefined;
      const query = typeof req.query.query === 'string' ? req.query.query : undefined;
      const companyFilter = typeof req.query.company === 'string' ? req.query.company : undefined;
      const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name';
      const sortOrder = typeof req.query.sortOrder === 'string' ? req.query.sortOrder : 'asc';
      
      const { items, info } = await listContacts(page, pageSize, typeFilter, healthFilter, query, companyFilter, sortBy, sortOrder);
      
      return res.status(200).json({
        items,
        page,
        pageSize,
        total: info.count ?? items.length,
        moreRecords: info.more_records ?? false,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      
      const firstName = (body?.firstName ?? '').toString().trim();
      const lastName = (body?.lastName ?? '').toString().trim();
      const email = (body?.email ?? '').toString().trim();
      
      if (!firstName && !lastName) {
        return res.status(400).json({ message: 'firstName or lastName is required' });
      }
      if (!email) {
        return res.status(400).json({ message: 'email is required' });
      }
      
      const contact = await createContact({
        firstName,
        lastName,
        email,
        phone: body?.phone?.toString().trim() || undefined,
        mobile: body?.mobile?.toString().trim() || undefined,
        accountId: body?.accountId?.toString().trim() || undefined,
        type: body?.type?.toString().trim() || undefined,
        role: body?.role?.toString().trim() || undefined,
        territory: body?.territory?.toString().trim() || undefined,
        notes: body?.notes?.toString().trim() || undefined,
      });
      
      return res.status(201).json(contact);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Contacts API error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ message });
  }
}

