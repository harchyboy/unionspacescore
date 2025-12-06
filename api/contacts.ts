import type { VercelRequest, VercelResponse } from '@vercel/node';

// ==========================================
// ZOHO LIBRARY (Inlined to fix import issues)
// ==========================================

interface ZohoContactRecord {
  id: string;
  Full_Name?: string;
  First_Name?: string;
  Last_Name?: string;
  Email?: string;
  Phone?: string;
  Mobile?: string;
  Company?: string;
  Title?: string;
  Contact_Type?: string;
  Last_Activity_Time?: string;
  Account_Name?: { id?: string; name?: string };
  [key: string]: unknown;
}

export interface ContactDto {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company?: string | null;
  accountId?: string | null;
  type?: string | null;
  role?: string | null;
  health?: string | null;
  lastActivityHours?: number | null;
  submarket?: string | null;
  territory?: string | null;
  notes?: string | null;
  // Performance Metrics
  referralVolume?: number | null;
  revenueAttribution?: number | null;
  conversionRate?: number | null;
  commissionPaid?: number | null;
  qualityScore?: number | null;
}

export interface CreateContactPayload {
  firstName?: string | null;
  lastName: string;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  company?: string | null;
  companyCity?: string | null;
  accountId?: string | null;
  type?: string | null;
  role?: string | null;
  territory?: string | null;
  notes?: string | null;
}

export interface UpdateContactPayload {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company?: string | null;
  accountId?: string | null;
  type?: string | null;
  role?: string | null;
  territory?: string | null;
  relationshipHealth?: string | null;
  notes?: string | null;
}

const requiredEnvVars = [
  'ZOHO_CLIENT_ID',
  'ZOHO_CLIENT_SECRET',
  'ZOHO_REFRESH_TOKEN',
] as const;

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

  // Handle 204 No Content (often used for success with no body)
  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoho API error (${response.status}): ${text}`);
  }

  // Handle potentially empty or non-JSON responses for 200 OK
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    throw new Error(`Invalid JSON response from Zoho: ${text.substring(0, 100)}...`);
  }
}

function hoursSince(dateString?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
}

function normaliseType(value?: string | null) {
  if (!value) return null;
  const lower = value.toLowerCase();
  const map: Record<string, string> = {
    'flex broker': 'Broker',
    'flex-broker': 'Broker',
    broker: 'Broker',
    brokers: 'Broker',
    'disposal agent': 'Disposal Agent',
    'disposal-agent': 'Disposal Agent',
    agent: 'Disposal Agent',
    tenant: 'Tenant',
    'tenant rep': 'Tenant',
    'traditional tenant reps': 'Tenant',
    supplier: 'Supplier',
    landlord: 'Landlord',
    internal: 'Internal',
  };
  return map[lower] || value;
}

function mapContact(record: ZohoContactRecord): ContactDto {
  const name =
    record.Full_Name ||
    `${record.First_Name ?? ''} ${record.Last_Name ?? ''}`.trim() ||
    record.Email ||
    'Unnamed contact';

  // Cast to access custom fields
  const r = record as Record<string, unknown>;

  return {
    id: record.id,
    name,
    firstName: record.First_Name ?? null,
    lastName: record.Last_Name ?? null,
    email: record.Email ?? null,
    phone: record.Phone ?? null,
    mobile: record.Mobile ?? null,
    company: record.Company ?? record.Account_Name?.name ?? null,
    accountId: (record.Account_Name as { id?: string } | undefined)?.id ?? null,
    type: normaliseType(record.Contact_Type),
    role: record.Title ?? null,
    lastActivityHours: hoursSince(record.Last_Activity_Time),
    submarket: (r.Submarket as string) ?? null,
    territory: (r.Territory as string) ?? null,
    notes: (r.Description as string) ?? null,
    health: (r.Relationship_Health as string) ?? null,
    // Performance Metrics from Zoho CRM
    referralVolume: typeof r.Referral_Volume === 'number' ? r.Referral_Volume : null,
    revenueAttribution: typeof r.Revenue_Attribution === 'number' ? r.Revenue_Attribution : null,
    conversionRate: typeof r.Conversion_Rate === 'number' ? r.Conversion_Rate : null,
    commissionPaid: typeof r.Commission_Paid === 'number' ? r.Commission_Paid : null,
    qualityScore: typeof r.Quality_Score === 'number' ? r.Quality_Score : null,
  };
}

async function listContacts(page = 1, perPage = 200) {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    sort_order: 'desc',
    sort_by: 'Modified_Time',
  });

  const response = await zohoRequest<{
    data?: ZohoContactRecord[];
    info?: { more_records?: boolean; count?: number };
  }>(`/crm/v2/Contacts?${params.toString()}`);

  const records = response.data ?? [];
  return {
    items: records.map(mapContact),
    info: response.info ?? {},
  };
}

async function getContact(id: string): Promise<ContactDto | null> {
  const response = await zohoRequest<{ data?: ZohoContactRecord[] }>(`/crm/v2/Contacts/${id}`);
  const record = response.data?.[0];
  return record ? mapContact(record) : null;
}

async function createContact(payload: CreateContactPayload) {
  const normalizedType = normaliseType(payload.type || undefined) || undefined;

  const body = {
    data: [
      {
        First_Name: payload.firstName || undefined,
        Last_Name: payload.lastName,
        Email: payload.email,
        Phone: payload.phone || undefined,
        Mobile: payload.mobile || undefined,
        Company: payload.company || undefined,
        Account_Name: payload.accountId ? { id: payload.accountId } : undefined,
        Billing_City: payload.companyCity || undefined,
        Contact_Type: normalizedType,
        Title: payload.role || undefined,
        Territory: payload.territory || undefined,
        Description: payload.notes || undefined,
      },
    ],
    trigger: [],
  };

  const response = await zohoRequest<{
    data?: { 
      code?: string;
      details?: { id: string; api_name?: string }; 
      message?: string;
      status?: string;
    }[];
  }>('/crm/v2/Contacts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const result = response.data?.[0];
  
  // Check for duplicate or error status
  if (result?.code === 'DUPLICATE_DATA' || (result?.status === 'error' && result?.code === 'MANDATORY_NOT_FOUND')) {
    throw new Error(result.message || 'Contact already exists or data is invalid');
  }

  const createdId = result?.details?.id;
  
  if (!createdId) {
    // If successful but no ID (should not happen for create)
    if (result?.status === 'success') {
       throw new Error('Zoho reported success but did not return an ID');
    }
    // Fallback error
    throw new Error(result?.message || 'Zoho did not return an ID for the new contact');
  }

  const contact = await getContact(createdId);
  if (!contact) {
    throw new Error('Unable to load newly created contact');
  }

  return contact;
}

async function updateContact(id: string, payload: Partial<UpdateContactPayload>) {
  // Build the update object, only including fields that are provided
  const updateData: Record<string, unknown> = {};
  
  if (payload.firstName !== undefined) updateData.First_Name = payload.firstName || null;
  if (payload.lastName !== undefined) updateData.Last_Name = payload.lastName || null;
  if (payload.email !== undefined) updateData.Email = payload.email || null;
  if (payload.phone !== undefined) updateData.Phone = payload.phone || null;
  if (payload.mobile !== undefined) updateData.Mobile = payload.mobile || null;
  if (payload.company !== undefined) updateData.Company = payload.company || null;
  if (payload.accountId !== undefined) {
    updateData.Account_Name = payload.accountId ? { id: payload.accountId } : null;
  }
  if (payload.type !== undefined) updateData.Contact_Type = normaliseType(payload.type) || null;
  if (payload.role !== undefined) updateData.Title = payload.role || null;
  if (payload.territory !== undefined) updateData.Territory = payload.territory || null;
  if (payload.relationshipHealth !== undefined) updateData.Relationship_Health = payload.relationshipHealth || null;
  if (payload.notes !== undefined) updateData.Description = payload.notes || null;

  const body = {
    data: [
      {
        id,
        ...updateData,
      },
    ],
    trigger: [],
  };

  const response = await zohoRequest<{
    data?: { details?: { id: string }; status?: string; message?: string }[];
  }>('/crm/v2/Contacts', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  const result = response.data?.[0];
  if (result?.status === 'error') {
    throw new Error(result.message || 'Failed to update contact in Zoho');
  }

  const contact = await getContact(id);
  if (!contact) {
    throw new Error('Unable to load updated contact');
  }

  return contact;
}

async function deleteContact(id: string) {
  await zohoRequest<{ data?: { status?: string }[] }>(`/crm/v2/Contacts?ids=${id}`, {
    method: 'DELETE',
  });
  return { success: true };
}

// ==========================================
// MAIN HANDLER
// ==========================================

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
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

  // Debug: Check if env vars are set (don't log actual values for security)
  const envCheck = {
    hasClientId: !!process.env.ZOHO_CLIENT_ID,
    hasClientSecret: !!process.env.ZOHO_CLIENT_SECRET,
    hasRefreshToken: !!process.env.ZOHO_REFRESH_TOKEN,
    dc: process.env.ZOHO_DC || 'eu (default)',
  };
  console.log('Environment check:', envCheck);

  try {
    if (req.method === 'GET') {
      const page = parseNumber(req.query.page, 1);
      const pageSize = parseNumber(req.query.pageSize, 200);
      const { items, info } = await listContacts(page, pageSize);

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
      const {
        firstName,
        lastName,
        email,
        phone,
        mobile,
        company,
        companyCity,
        accountId,
        type,
        role,
        territory,
        notes,
      } = body ?? {};

      if (!lastName || !email) {
        return res.status(400).json({
          message: 'lastName and email are required',
        });
      }

      const contact = await createContact({
        firstName,
        lastName,
        email,
        phone,
        mobile,
        company,
        companyCity,
        accountId,
        type,
        role,
        territory,
        notes,
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
