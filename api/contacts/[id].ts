import type { VercelRequest, VercelResponse } from '@vercel/node';

// ==========================================
// ZOHO LIBRARY (Inlined for serverless)
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
  Account_Name?: { name?: string };
  [key: string]: unknown;
}

interface ContactDto {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company?: string | null;
  type?: string | null;
  role?: string | null;
  health?: string | null;
  lastActivityHours?: number | null;
  submarket?: string | null;
  referralVolume?: number | null;
  revenueAttribution?: number | null;
  conversionRate?: number | null;
  commissionPaid?: number | null;
  qualityScore?: number | null;
}

interface UpdateContactPayload {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company?: string | null;
  type?: string | null;
  role?: string | null;
  territory?: string | null;
  relationshipHealth?: string | null;
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

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoho API error (${response.status}): ${text}`);
  }

  return response.json() as Promise<T>;
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
    'flex broker': 'Flex Broker',
    'flex-broker': 'Flex Broker',
    broker: 'Flex Broker',
    brokers: 'Flex Broker',
    'disposal agent': 'Disposal Agent',
    'disposal-agent': 'Disposal Agent',
    agent: 'Disposal Agent',
    tenant: 'Tenant',
    'tenant rep': 'Tenant',
    'traditional tenant reps': 'Tenant',
    supplier: 'Supplier',
    landlord: 'Landlord',
  };
  return map[lower] || value;
}

function mapContact(record: ZohoContactRecord): ContactDto {
  const name =
    record.Full_Name ||
    `${record.First_Name ?? ''} ${record.Last_Name ?? ''}`.trim() ||
    record.Email ||
    'Unnamed contact';

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
    type: normaliseType(record.Contact_Type),
    role: record.Title ?? null,
    lastActivityHours: hoursSince(record.Last_Activity_Time),
    submarket: (r.Submarket as string) ?? null,
    health: (r.Relationship_Health as string) ?? null,
    referralVolume: typeof r.Referral_Volume === 'number' ? r.Referral_Volume : null,
    revenueAttribution: typeof r.Revenue_Attribution === 'number' ? r.Revenue_Attribution : null,
    conversionRate: typeof r.Conversion_Rate === 'number' ? r.Conversion_Rate : null,
    commissionPaid: typeof r.Commission_Paid === 'number' ? r.Commission_Paid : null,
    qualityScore: typeof r.Quality_Score === 'number' ? r.Quality_Score : null,
  };
}

async function getContact(id: string): Promise<ContactDto | null> {
  const response = await zohoRequest<{ data?: ZohoContactRecord[] }>(`/crm/v2/Contacts/${id}`);
  const record = response.data?.[0];
  return record ? mapContact(record) : null;
}

async function updateContact(id: string, payload: UpdateContactPayload) {
  const updateData: Record<string, unknown> = {};
  
  if (payload.firstName !== undefined) updateData.First_Name = payload.firstName || null;
  if (payload.lastName !== undefined) updateData.Last_Name = payload.lastName || null;
  if (payload.email !== undefined) updateData.Email = payload.email || null;
  if (payload.phone !== undefined) updateData.Phone = payload.phone || null;
  if (payload.mobile !== undefined) updateData.Mobile = payload.mobile || null;
  if (payload.company !== undefined) updateData.Company = payload.company || null;
  if (payload.type !== undefined) updateData.Contact_Type = normaliseType(payload.type) || null;
  if (payload.role !== undefined) updateData.Title = payload.role || null;
  if (payload.territory !== undefined) updateData.Territory = payload.territory || null;
  if (payload.relationshipHealth !== undefined) updateData.Relationship_Health = payload.relationshipHealth || null;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const contactId = Array.isArray(id) ? id[0] : id;

  if (!contactId) {
    return res.status(400).json({ message: 'Contact ID is required' });
  }

  try {
    // GET /api/contacts/[id] - Get single contact
    if (req.method === 'GET') {
      const contact = await getContact(contactId);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      return res.status(200).json(contact);
    }

    // PUT or PATCH /api/contacts/[id] - Update contact
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      const { firstName, lastName, email, phone, mobile, company, type, role, territory, relationshipHealth } = body ?? {};

      const contact = await updateContact(contactId, {
        firstName,
        lastName,
        email,
        phone,
        mobile,
        company,
        type,
        role,
        territory,
        relationshipHealth,
      });

      return res.status(200).json(contact);
    }

    // DELETE /api/contacts/[id] - Delete contact
    if (req.method === 'DELETE') {
      await deleteContact(contactId);
      return res.status(200).json({ success: true, message: 'Contact deleted' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Contacts API error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ message });
  }
}

