import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ZohoAccountRecord {
  id: string;
  Account_Name?: string;
  Billing_City?: string;
  Website?: string;
  [key: string]: unknown;
}

interface AccountDto {
  id: string;
  name: string;
  city?: string | null;
  website?: string | null;
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

  return response.json() as Promise<T>;
}

function mapAccount(record: ZohoAccountRecord): AccountDto {
  return {
    id: record.id,
    name: record.Account_Name || 'Unnamed Account',
    city: record.Billing_City ?? null,
    website: record.Website ?? null,
  };
}

async function listAccounts(search?: string, limit = 10) {
  const trimmed = search?.trim();
  if (trimmed && trimmed.length >= 3) {
    const criteria = encodeURIComponent(`(Account_Name:contains:"${trimmed}")`);
    const response = await zohoRequest<{ data?: ZohoAccountRecord[] }>(
      `/crm/v2/Accounts/search?criteria=${criteria}&per_page=${limit}`,
    );
    return (response.data ?? []).map(mapAccount);
  }

  const response = await zohoRequest<{ data?: ZohoAccountRecord[] }>(`/crm/v2/Accounts?per_page=${limit}`);
  return (response.data ?? []).map(mapAccount);
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

  return mapAccount({ id, Account_Name: payload.name, Billing_City: payload.city ?? undefined });
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const items = await listAccounts(search, 20);
      return res.status(200).json({ items });
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


