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

export interface ContactDto {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  type?: string | null;
  role?: string | null;
  health?: string | null;
  lastActivityHours?: number | null;
  submarket?: string | null;
}

export interface CreateContactPayload {
  firstName?: string | null;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  type?: string | null;
  role?: string | null;
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

  return {
    id: record.id,
    name,
    email: record.Email ?? null,
    phone: record.Phone ?? record.Mobile ?? null,
    company: record.Company ?? record.Account_Name?.name ?? null,
    type: normaliseType(record.Contact_Type),
    role: record.Title ?? null,
    lastActivityHours: hoursSince(record.Last_Activity_Time),
    submarket: (record as { Submarket__c?: string }).Submarket__c ?? null,
    health: (record as { Relationship_Health__c?: string }).Relationship_Health__c ?? null,
  };
}

export async function listContacts(page = 1, perPage = 200) {
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

export async function getContact(id: string): Promise<ContactDto | null> {
  const response = await zohoRequest<{ data?: ZohoContactRecord[] }>(`/crm/v2/Contacts/${id}`);
  const record = response.data?.[0];
  return record ? mapContact(record) : null;
}

export async function createContact(payload: CreateContactPayload) {
  const body = {
    data: [
      {
        First_Name: payload.firstName || undefined,
        Last_Name: payload.lastName,
        Email: payload.email,
        Phone: payload.phone || undefined,
        Company: payload.company || undefined,
        Contact_Type: normaliseType(payload.type || undefined) || undefined,
        Title: payload.role || undefined,
      },
    ],
    trigger: [],
  };

  const response = await zohoRequest<{
    data?: { details?: { id: string } }[];
  }>('/crm/v2/Contacts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const createdId = response.data?.[0]?.details?.id;
  if (!createdId) {
    throw new Error('Zoho did not return an ID for the new contact');
  }

  const contact = await getContact(createdId);
  if (!contact) {
    throw new Error('Unable to load newly created contact');
  }

  return contact;
}

