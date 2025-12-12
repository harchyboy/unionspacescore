// Shared Zoho API utilities

const requiredEnvVars = ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'] as const;

export function ensureZohoEnv() {
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var ${key}`);
    }
  }
}

const ZOHO_DC = process.env.ZOHO_DC || 'eu';
export const TOKEN_URL = `https://accounts.zoho.${ZOHO_DC}/oauth/v2/token`;
export const API_BASE = `https://www.zohoapis.${ZOHO_DC}`;

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getZohoAccessToken(): Promise<string> {
  ensureZohoEnv();
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

export async function zohoRequest<T>(path: string, init: FetchOptions = {}): Promise<T> {
  const token = await getZohoAccessToken();
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

// Zoho record types
export interface ZohoContactRecord {
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
  Contact_Type?: string;
  Territory?: string;
  Relationship_Health?: string;
  Relationship_Health_Score?: number;
  LinkedIn_URL?: string;
  [key: string]: unknown;
}

export interface ZohoAccountRecord {
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

export interface ZohoPropertyRecord {
  id: string;
  Name: string; // Property Name
  Address_Line?: string;
  Postcode?: string;
  City?: string;
  Submarkets?: string;
  Country?: string;
  Total_Size_Sq_Ft?: number;
  Floor_Count?: number;
  Lifts?: string;
  Built_Year?: number;
  Refurbished_Year?: number;
  Parking?: string;
  Marketing_Status?: string;
  Marketing_Visibility?: string;
  Marketing_Fit_Out?: string;
  EPC_Rating?: string;
  EPC_Ref?: string;
  EPC_Expiry?: string;
  BREEAM_Rating?: string;
  Modified_Time?: string;
  Created_Time?: string;
  [key: string]: unknown;
}

export interface ZohoUnitRecord {
  id: string;
  Name: string; // Usually Unit Code
  Property?: { id: string; name: string }; // Lookup to Property
  Floor?: string;
  Size_Sq_Ft?: number;
  Desks?: number;
  Status?: string;
  Fit_Out?: string;
  Price_Per_Sq_Ft?: number;
  Price_Per_Month?: number;
  Pipeline_Stage?: string;
  Modified_Time?: string;
  Created_Time?: string;
  [key: string]: unknown;
}

