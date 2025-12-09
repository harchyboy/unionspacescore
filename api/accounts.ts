import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ZohoAccountRecord {
  id: string;
  Account_Name?: string;
  Account_Type?: string;
  Industry?: string;
  Billing_Street?: string;
  Billing_City?: string;
  Billing_Code?: string;
  Billing_Country?: string;
  Website?: string;
  Phone?: string;
  Fax?: string;
  Employees?: number;
  Annual_Revenue?: number;
  Description?: string;
  Modified_Time?: string;
  Created_Time?: string;
  [key: string]: unknown;
}

interface ContactDto {
  id: string;
  name: string;
  email?: string | null;
  role?: string | null;
}

interface AccountDto {
  id: string;
  name: string;
  type?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
  employeeCount?: number | null;
  annualRevenue?: number | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  contacts?: ContactDto[];
  contactCount?: number | null;
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

function mapAccount(record: ZohoAccountRecord, contacts?: ContactDto[]): AccountDto {
  return {
    id: record.id,
    name: record.Account_Name || 'Unnamed Account',
    type: record.Account_Type ?? null,
    industry: record.Industry ?? null,
    address: record.Billing_Street ?? null,
    city: record.Billing_City ?? null,
    postcode: record.Billing_Code ?? null,
    country: record.Billing_Country ?? null,
    website: record.Website ?? null,
    phone: record.Phone ?? null,
    employeeCount: record.Employees ?? null,
    annualRevenue: record.Annual_Revenue ?? null,
    description: record.Description ?? null,
    createdAt: record.Created_Time ?? null,
    updatedAt: record.Modified_Time ?? null,
    contacts: contacts ?? [],
    contactCount: contacts?.length ?? null,
  };
}

// Fetch contacts for a list of account IDs
async function getContactsForAccounts(accountIds: string[]): Promise<Map<string, ContactDto[]>> {
  const contactsMap = new Map<string, ContactDto[]>();
  
  if (accountIds.length === 0) return contactsMap;
  
  // Initialize empty arrays for all account IDs
  accountIds.forEach(id => contactsMap.set(id, []));
  
  try {
    // Fetch contacts that belong to these accounts
    // Use search to find contacts with Account_Name.id in our list
    for (const accountId of accountIds) {
      const criteria = `(Account_Name:equals:${accountId})`;
      const response = await zohoRequest<{
        data?: { id: string; Full_Name?: string; First_Name?: string; Last_Name?: string; Email?: string; Title?: string; Account_Name?: { id?: string } }[];
      }>(`/crm/v2/Contacts/search?criteria=${encodeURIComponent(criteria)}&per_page=5`);
      
      if (response.data) {
        const contacts = response.data.map(c => ({
          id: c.id,
          name: c.Full_Name || `${c.First_Name ?? ''} ${c.Last_Name ?? ''}`.trim() || 'Unnamed',
          email: c.Email ?? null,
          role: c.Title ?? null,
        }));
        contactsMap.set(accountId, contacts);
      }
    }
  } catch (error) {
    console.error('Error fetching contacts for accounts:', error);
  }
  
  return contactsMap;
}

async function getTotalCount(typeFilter?: string, search?: string): Promise<number> {
  let total = 0;
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    let apiPath: string;
    
    if (search && search.trim().length >= 2) {
      let criteria = `(Account_Name:contains:${search.trim()})`;
      if (typeFilter) {
        criteria = `((Account_Name:contains:${search.trim()})and(Account_Type:equals:${typeFilter}))`;
      }
      apiPath = `/crm/v2/Accounts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=200`;
    } else if (typeFilter) {
      const criteria = `(Account_Type:equals:${typeFilter})`;
      apiPath = `/crm/v2/Accounts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=200`;
    } else {
      apiPath = `/crm/v2/Accounts?page=${page}&per_page=200`;
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

async function listAccounts(page = 1, perPage = 50, typeFilter?: string, search?: string) {
  let apiPath: string;
  
  const trimmed = search?.trim();
  if (trimmed && trimmed.length >= 2) {
    let criteria = `(Account_Name:contains:${trimmed})`;
    if (typeFilter) {
      criteria = `((Account_Name:contains:${trimmed})and(Account_Type:equals:${typeFilter}))`;
    }
    apiPath = `/crm/v2/Accounts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=${perPage}&sort_order=desc&sort_by=Modified_Time`;
  } else if (typeFilter) {
    const criteria = `(Account_Type:equals:${typeFilter})`;
    apiPath = `/crm/v2/Accounts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=${perPage}&sort_order=desc&sort_by=Modified_Time`;
  } else {
    apiPath = `/crm/v2/Accounts?page=${page}&per_page=${perPage}&sort_order=desc&sort_by=Modified_Time`;
  }

  const response = await zohoRequest<{
    data?: ZohoAccountRecord[];
    info?: { more_records?: boolean; count?: number };
  }>(apiPath);

  const records = response.data ?? [];
  const moreRecords = response.info?.more_records ?? false;
  
  // Get accurate total count
  const total = await getTotalCount(typeFilter, search);
  
  // Fetch contacts for each account
  const accountIds = records.map(r => r.id);
  const contactsMap = await getContactsForAccounts(accountIds);

  return {
    items: records.map(record => mapAccount(record, contactsMap.get(record.id))),
    info: { count: total, more_records: moreRecords },
  };
}

async function createAccount(payload: { name: string; city?: string | null }) {
  const body = {
    data: [
      {
        Account_Name: payload.name,
        Billing_City: payload.city || undefined,
      },
    ],
    trigger: [],
  };

  const response = await zohoRequest<{
    data?: { details?: { id: string }; status?: string; message?: string }[];
  }>('/crm/v2/Accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const details = response.data?.[0];
  if (details?.status === 'error') {
    throw new Error(details.message || 'Failed to create account in Zoho');
  }

  const id = details?.details?.id;
  if (!id) {
    throw new Error('Zoho did not return an Account ID');
  }

  // Return a normalised DTO
  return mapAccount({ id, Account_Name: payload.name, Billing_City: payload.city ?? undefined });
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
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      
      const { items, info } = await listAccounts(page, pageSize, typeFilter, search);
      
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
      const name = (body?.name ?? '').toString().trim();
      if (!name) {
        return res.status(400).json({ message: 'name is required' });
      }
      const city = body?.city ? body.city.toString().trim() : undefined;
      const account = await createAccount({ name, city });
      return res.status(201).json(account);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Accounts API error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ message });
  }
}


