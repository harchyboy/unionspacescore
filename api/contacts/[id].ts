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

async function getContact(id: string): Promise<ContactDto | null> {
  try {
    const response = await zohoRequest<{
      data?: ZohoContactRecord[];
    }>(`/crm/v2/Contacts/${id}`);

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return mapContact(response.data[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return null;
  }
}

async function updateContact(id: string, payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  accountId?: string;
  type?: string;
  role?: string;
  territory?: string;
  notes?: string;
}): Promise<ContactDto | null> {
  const updateData: Record<string, unknown> = { id };
  
  if (payload.firstName !== undefined) updateData.First_Name = payload.firstName;
  if (payload.lastName !== undefined) updateData.Last_Name = payload.lastName;
  if (payload.email !== undefined) updateData.Email = payload.email;
  if (payload.phone !== undefined) updateData.Phone = payload.phone;
  if (payload.mobile !== undefined) updateData.Mobile = payload.mobile;
  if (payload.accountId !== undefined) updateData.Account_Name = payload.accountId ? { id: payload.accountId } : null;
  if (payload.type !== undefined) updateData.Contact_Type = payload.type;
  if (payload.role !== undefined) updateData.Title = payload.role;
  if (payload.territory !== undefined) updateData.Territory = payload.territory;
  if (payload.notes !== undefined) updateData.Description = payload.notes;

  const body = {
    data: [updateData],
    trigger: [],
  };

  const response = await zohoRequest<{
    data?: { details?: { id: string }; status?: string; message?: string }[];
  }>('/crm/v2/Contacts', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  const details = response.data?.[0];
  if (details?.status === 'error') {
    throw new Error(details.message || 'Failed to update contact in Zoho');
  }

  // Fetch and return the updated contact
  return getContact(id);
}

async function deleteContact(id: string): Promise<boolean> {
  const response = await zohoRequest<{
    data?: { status?: string; message?: string }[];
  }>(`/crm/v2/Contacts?ids=${id}`, {
    method: 'DELETE',
  });

  const details = response.data?.[0];
  if (details?.status === 'error') {
    throw new Error(details.message || 'Failed to delete contact in Zoho');
  }

  return true;
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Contact ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const contact = await getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      return res.status(200).json(contact);
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      
      const contact = await updateContact(id, {
        firstName: body?.firstName?.toString().trim(),
        lastName: body?.lastName?.toString().trim(),
        email: body?.email?.toString().trim(),
        phone: body?.phone?.toString().trim(),
        mobile: body?.mobile?.toString().trim(),
        accountId: body?.accountId?.toString().trim(),
        type: body?.type?.toString().trim(),
        role: body?.role?.toString().trim(),
        territory: body?.territory?.toString().trim(),
        notes: body?.notes?.toString().trim(),
      });
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      return res.status(200).json(contact);
    }

    if (req.method === 'DELETE') {
      await deleteContact(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Contact API error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ message });
  }
}

