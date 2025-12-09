import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured, DbAccount } from './lib/supabase.js';
import { zohoRequest, ZohoAccountRecord } from './lib/zoho.js';

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

// Map database record to DTO
function mapDbAccount(record: DbAccount, contacts?: ContactDto[]): AccountDto {
  return {
    id: record.zoho_id,
    name: record.name,
    type: record.account_type,
    industry: record.industry,
    address: record.address,
    city: record.city,
    postcode: record.postcode,
    country: record.country,
    website: record.website,
    phone: record.phone,
    employeeCount: record.employee_count,
    annualRevenue: record.annual_revenue,
    description: record.description,
    createdAt: record.zoho_created_at,
    updatedAt: record.zoho_modified_at,
    contacts: contacts ?? [],
    contactCount: contacts?.length ?? null,
  };
}

// Map Zoho record to DTO
function mapZohoAccount(record: ZohoAccountRecord, contacts?: ContactDto[]): AccountDto {
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

// =====================================================
// DATABASE OPERATIONS
// =====================================================

async function getContactsForAccountFromDb(accountZohoId: string): Promise<ContactDto[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from('contacts')
    .select('zoho_id, full_name, email, role')
    .eq('account_id', accountZohoId)
    .limit(5);

  if (!data) return [];
  
  return data.map((c: { zoho_id: string; full_name: string; email: string | null; role: string | null }) => ({
    id: c.zoho_id,
    name: c.full_name,
    email: c.email,
    role: c.role,
  }));
}

async function listAccountsFromDb(
  page: number,
  perPage: number,
  typeFilter?: string,
  search?: string
) {
  const supabase = getSupabase();
  if (!supabase) return null;

  let dbQuery = supabase.from('accounts').select('*', { count: 'exact' });

  // Apply filters
  if (typeFilter) {
    dbQuery = dbQuery.eq('account_type', typeFilter);
  }
  if (search && search.trim().length >= 2) {
    dbQuery = dbQuery.ilike('name', `%${search}%`);
  }

  // Apply sorting
  dbQuery = dbQuery.order('zoho_modified_at', { ascending: false });

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  dbQuery = dbQuery.range(from, to);

  const { data, count, error } = await dbQuery;

  if (error) {
    console.error('Database query error:', error);
    return null;
  }

  // Fetch contacts for each account
  const accounts = data as DbAccount[];
  const accountsWithContacts = await Promise.all(
    accounts.map(async (account) => {
      const contacts = await getContactsForAccountFromDb(account.zoho_id);
      return mapDbAccount(account, contacts);
    })
  );

  return {
    items: accountsWithContacts,
    total: count ?? 0,
  };
}

async function getAccountFromDb(zohoId: string): Promise<AccountDto | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('zoho_id', zohoId)
    .single();

  if (error || !data) return null;
  
  const contacts = await getContactsForAccountFromDb(zohoId);
  return mapDbAccount(data as DbAccount, contacts);
}

// =====================================================
// ZOHO OPERATIONS (FALLBACK)
// =====================================================

async function getContactsForAccountsFromZoho(accountIds: string[]): Promise<Map<string, ContactDto[]>> {
  const contactsMap = new Map<string, ContactDto[]>();
  
  if (accountIds.length === 0) return contactsMap;
  
  accountIds.forEach(id => contactsMap.set(id, []));
  
  try {
    for (const accountId of accountIds) {
      const criteria = `(Account_Name:equals:${accountId})`;
      const response = await zohoRequest<{
        data?: { id: string; Full_Name?: string; First_Name?: string; Last_Name?: string; Email?: string; Title?: string }[];
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

async function getTotalCountFromZoho(typeFilter?: string, search?: string): Promise<number> {
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
    
    total += response.data?.length ?? 0;
    hasMore = response.info?.more_records ?? false;
    page++;
    if (page > 50) break;
  }
  
  return total;
}

async function listAccountsFromZoho(page: number, perPage: number, typeFilter?: string, search?: string) {
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
    info?: { more_records?: boolean };
  }>(apiPath);

  const records = response.data ?? [];
  const moreRecords = response.info?.more_records ?? false;
  const total = await getTotalCountFromZoho(typeFilter, search);
  
  const accountIds = records.map(r => r.id);
  const contactsMap = await getContactsForAccountsFromZoho(accountIds);

  return {
    items: records.map(record => mapZohoAccount(record, contactsMap.get(record.id))),
    total,
    moreRecords,
  };
}

async function getAccountFromZoho(id: string): Promise<AccountDto | null> {
  try {
    const response = await zohoRequest<{ data?: ZohoAccountRecord[] }>(
      `/crm/v2/Accounts/${id}`
    );
    const record = response.data?.[0];
    if (!record) return null;
    
    const contactsMap = await getContactsForAccountsFromZoho([id]);
    return mapZohoAccount(record, contactsMap.get(id));
  } catch {
    return null;
  }
}

// =====================================================
// WRITE OPERATIONS (Zoho + Database)
// =====================================================

async function createAccount(payload: { name: string; city?: string | null }) {
  const body = {
    data: [{
      Account_Name: payload.name,
      Billing_City: payload.city || undefined,
    }],
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

  // Also insert into database if configured
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from('accounts').insert({
      zoho_id: id,
      name: payload.name,
      city: payload.city || null,
    });
  }

  return mapZohoAccount({ id, Account_Name: payload.name, Billing_City: payload.city ?? undefined });
}

async function updateAccount(id: string, payload: Record<string, unknown>) {
  const zohoPayload: Record<string, unknown> = {};
  
  if (payload.name !== undefined) zohoPayload.Account_Name = payload.name;
  if (payload.type !== undefined) zohoPayload.Account_Type = payload.type;
  if (payload.industry !== undefined) zohoPayload.Industry = payload.industry;
  if (payload.city !== undefined) zohoPayload.Billing_City = payload.city;
  if (payload.address !== undefined) zohoPayload.Billing_Street = payload.address;
  if (payload.postcode !== undefined) zohoPayload.Billing_Code = payload.postcode;
  if (payload.country !== undefined) zohoPayload.Billing_Country = payload.country;
  if (payload.website !== undefined) zohoPayload.Website = payload.website;
  if (payload.phone !== undefined) zohoPayload.Phone = payload.phone;

  const body = { data: [zohoPayload], trigger: [] };

  const response = await zohoRequest<{
    data?: { details?: { id: string }; status?: string; message?: string }[];
  }>(`/crm/v2/Accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  const details = response.data?.[0];
  if (details?.status === 'error') {
    throw new Error(details.message || 'Failed to update account in Zoho');
  }

  // Also update in database if configured
  const supabase = getSupabase();
  if (supabase) {
    const dbPayload: Record<string, unknown> = {};
    if (payload.name !== undefined) dbPayload.name = payload.name;
    if (payload.type !== undefined) dbPayload.account_type = payload.type;
    if (payload.industry !== undefined) dbPayload.industry = payload.industry;
    if (payload.city !== undefined) dbPayload.city = payload.city;
    if (payload.address !== undefined) dbPayload.address = payload.address;
    if (payload.postcode !== undefined) dbPayload.postcode = payload.postcode;
    if (payload.country !== undefined) dbPayload.country = payload.country;
    if (payload.website !== undefined) dbPayload.website = payload.website;
    if (payload.phone !== undefined) dbPayload.phone = payload.phone;

    await supabase.from('accounts').update(dbPayload).eq('zoho_id', id);
  }

  return getAccountFromZoho(id);
}

async function deleteAccountById(id: string) {
  await zohoRequest(`/crm/v2/Accounts/${id}`, { method: 'DELETE' });

  const supabase = getSupabase();
  if (supabase) {
    await supabase.from('accounts').delete().eq('zoho_id', id);
  }
}

// =====================================================
// API HANDLER
// =====================================================

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
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

      // Try database first if configured
      if (isSupabaseConfigured()) {
        const dbResult = await listAccountsFromDb(page, pageSize, typeFilter, search);
        if (dbResult && dbResult.items.length > 0) {
          return res.status(200).json({
            items: dbResult.items,
            page,
            pageSize,
            total: dbResult.total,
            moreRecords: (page * pageSize) < dbResult.total,
            source: 'database',
          });
        }
      }

      // Fallback to Zoho API
      const zohoResult = await listAccountsFromZoho(page, pageSize, typeFilter, search);
      
      return res.status(200).json({
        items: zohoResult.items,
        page,
        pageSize,
        total: zohoResult.total,
        moreRecords: zohoResult.moreRecords,
        source: 'zoho',
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

// Export for potential use by accounts/[id].ts
export { updateAccount, deleteAccountById, getAccountFromDb, getAccountFromZoho };
