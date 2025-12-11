import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured, DbContact } from './lib/supabase.js';
import { zohoRequest, ZohoContactRecord } from './lib/zoho.js';

interface ContactDto {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  avatar?: string | null;
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
  linkedinUrl?: string | null;
  enrichmentStatus?: string | null;
  enrichedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Map database record to DTO
function mapDbContact(record: DbContact): ContactDto {
  return {
    id: record.zoho_id,
    firstName: record.first_name,
    lastName: record.last_name,
    name: record.full_name,
    email: record.email,
    // Use a fresh cache-busting token so newly uploaded photos show immediately
    avatar: record.zoho_id ? `/api/contacts/${record.zoho_id}/photo?t=${Date.now()}` : null,
    phone: record.phone,
    mobile: record.mobile,
    role: record.role,
    company: record.company_name,
    accountId: record.account_id,
    type: record.contact_type,
    territory: record.territory,
    health: record.relationship_health,
    relationshipHealthScore: record.relationship_health_score,
    lastActivity: record.zoho_modified_at,
    linkedinUrl: record.linkedin_url,
    enrichmentStatus: record.enrichment_status,
    enrichedAt: record.enriched_at,
    createdAt: record.zoho_created_at,
    updatedAt: record.zoho_modified_at,
  };
}

// Map Zoho record to DTO (fallback)
function mapZohoContact(record: ZohoContactRecord): ContactDto {
  const firstName = record.First_Name || '';
  const lastName = record.Last_Name || '';
  const fullName = record.Full_Name || `${firstName} ${lastName}`.trim() || 'Unnamed Contact';
  
  // Determine type: prefer Contact_Type field, fallback to Tag, default to Broker
  let type = record.Contact_Type;
  if (!type && Array.isArray(record.Tag)) {
    const tags = record.Tag as { name: string }[];
    // Check for known types in tags
    const typeTag = tags.find(t => 
      ['Broker', 'Disposal Agent', 'Tenant', 'Landlord', 'Supplier'].includes(t.name)
    );
    if (typeTag) {
      type = typeTag.name;
    }
  }

  return {
    id: record.id,
    firstName,
    lastName,
    name: fullName,
    email: record.Email || '',
    // Use a fresh cache-busting token so newly uploaded photos show immediately
    avatar: record.id ? `/api/contacts/${record.id}/photo?t=${Date.now()}` : null,
    phone: record.Phone ?? null,
    mobile: record.Mobile ?? null,
    role: record.Title ?? null,
    company: record.Account_Name?.name ?? null,
    accountId: record.Account_Name?.id ?? null,
    type: type ?? 'Broker',
    territory: record.Territory ?? record.Mailing_City ?? null,
    health: record.Relationship_Health ?? 'good',
    relationshipHealthScore: record.Relationship_Health_Score ?? null,
    linkedinUrl: record.LinkedIn_URL ?? null,
    lastActivity: record.Modified_Time ?? null,
    createdAt: record.Created_Time ?? null,
    updatedAt: record.Modified_Time ?? null,
  };
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

async function listContactsFromDb(
  page: number,
  perPage: number,
  typeFilter?: string,
  healthFilter?: string,
  query?: string,
  companyFilter?: string,
  sortBy?: string,
  sortOrder?: string
) {
  const supabase = getSupabase();
  if (!supabase) return null;

  let dbQuery = supabase.from('contacts').select('*', { count: 'exact' });

  // Apply filters
  if (typeFilter) {
    dbQuery = dbQuery.eq('contact_type', typeFilter);
  }
  if (healthFilter) {
    dbQuery = dbQuery.eq('relationship_health', healthFilter);
  }
  if (query && query.trim().length >= 2) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  }
  if (companyFilter) {
    dbQuery = dbQuery.eq('account_id', companyFilter);
  }

  // Apply sorting
  const sortColumn = sortBy === 'name' ? 'full_name' : 
                     sortBy === 'lastActivity' ? 'zoho_modified_at' :
                     sortBy === 'company' ? 'company_name' : 'full_name';
  dbQuery = dbQuery.order(sortColumn, { ascending: sortOrder !== 'desc' });

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  dbQuery = dbQuery.range(from, to);

  const { data, count, error } = await dbQuery;

  if (error) {
    console.error('Database query error:', error);
    return null;
  }

  return {
    items: (data as DbContact[]).map(mapDbContact),
    total: count ?? 0,
  };
}

async function getContactFromDb(id: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Check if ID is a UUID (Supabase ID)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase.from('contacts').select('*');
  
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('zoho_id', id);
  }

  const { data, error } = await query.single();

  if (error || !data) return null;
  return mapDbContact(data as DbContact);
}

// =====================================================
// ZOHO OPERATIONS (FALLBACK)
// =====================================================

function buildCriteria(typeFilter?: string, healthFilter?: string, query?: string, companyFilter?: string): string | null {
  const conditions: string[] = [];
  
  if (typeFilter) {
    const orConditions: string[] = [];
    orConditions.push(`(Contact_Type:equals:${typeFilter})`);
    
    // Also try plural form (e.g. "Disposal Agents")
    if (!typeFilter.endsWith('s')) {
      orConditions.push(`(Contact_Type:equals:${typeFilter}s)`);
    }

    // Also try matching Tags (if user used tags instead of field)
    orConditions.push(`(Tag:equals:${typeFilter})`);
    
    conditions.push(`(${orConditions.join('or')})`);
  }
  if (healthFilter) {
    conditions.push(`(Relationship_Health:equals:${healthFilter})`);
  }
  if (query && query.trim().length >= 2) {
    conditions.push(`((Full_Name:contains:${query.trim()})or(Email:contains:${query.trim()}))`);
  }
  if (companyFilter) {
    conditions.push(`(Account_Name:equals:${companyFilter})`);
  }
  
  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];
  return `(${conditions.join('and')})`;
}

async function getTotalCountFromZoho(typeFilter?: string, healthFilter?: string, query?: string, companyFilter?: string): Promise<number> {
  let total = 0;
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const criteria = buildCriteria(typeFilter, healthFilter, query, companyFilter);
    const apiPath = criteria
      ? `/crm/v2/Contacts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=200`
      : `/crm/v2/Contacts?page=${page}&per_page=200`;
    
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

async function listContactsFromZoho(
  page: number,
  perPage: number,
  typeFilter?: string,
  healthFilter?: string,
  query?: string,
  companyFilter?: string,
  sortBy?: string,
  sortOrder?: string
) {
  const criteria = buildCriteria(typeFilter, healthFilter, query, companyFilter);
  const zohoSortField = sortBy === 'name' ? 'Full_Name' : 
                        sortBy === 'lastActivity' ? 'Modified_Time' :
                        sortBy === 'company' ? 'Account_Name' : 'Full_Name';
  const zohoSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';
  
  const apiPath = criteria
    ? `/crm/v2/Contacts/search?criteria=${encodeURIComponent(criteria)}&page=${page}&per_page=${perPage}&sort_order=${zohoSortOrder}&sort_by=${zohoSortField}`
    : `/crm/v2/Contacts?page=${page}&per_page=${perPage}&sort_order=${zohoSortOrder}&sort_by=${zohoSortField}`;

  const response = await zohoRequest<{
    data?: ZohoContactRecord[];
    info?: { more_records?: boolean };
  }>(apiPath);

  const records = response.data ?? [];
  const total = await getTotalCountFromZoho(typeFilter, healthFilter, query, companyFilter);

  return {
    items: records.map(mapZohoContact),
    total,
    moreRecords: response.info?.more_records ?? false,
  };
}

async function getContactFromZoho(id: string) {
  const response = await zohoRequest<{ data?: ZohoContactRecord[] }>(
    `/crm/v2/Contacts/${id}`
  );
  const record = response.data?.[0];
  return record ? mapZohoContact(record) : null;
}

// =====================================================
// WRITE OPERATIONS (Zoho + Database)
// =====================================================

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
  // Create in Zoho first
  const body = {
    data: [{
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
    }],
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

  // Also insert into database if configured
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from('contacts').insert({
      zoho_id: id,
      first_name: payload.firstName,
      last_name: payload.lastName,
      full_name: `${payload.firstName} ${payload.lastName}`.trim(),
      email: payload.email,
      phone: payload.phone || null,
      mobile: payload.mobile || null,
      role: payload.role || null,
      account_id: payload.accountId || null,
      contact_type: payload.type || 'Broker',
      territory: payload.territory || null,
      description: payload.notes || null,
    });
  }

  return mapZohoContact({
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

async function updateContact(id: string, payload: Record<string, unknown>) {
  // Update in Zoho first
  const zohoPayload: Record<string, unknown> = {};
  
  // Helper to only add non-empty values
  const addIfNotEmpty = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') {
      zohoPayload[key] = value;
    }
  };
  
  addIfNotEmpty('First_Name', payload.firstName);
  addIfNotEmpty('Last_Name', payload.lastName);
  addIfNotEmpty('Email', payload.email);
  addIfNotEmpty('Phone', payload.phone);
  addIfNotEmpty('Mobile', payload.mobile);
  addIfNotEmpty('Title', payload.role);
  addIfNotEmpty('Contact_Type', payload.type);
  addIfNotEmpty('Territory', payload.territory);
  addIfNotEmpty('Description', payload.notes);
  
  // Handle accountId - can be set to null to unlink
  if (payload.accountId !== undefined) {
    zohoPayload.Account_Name = payload.accountId && payload.accountId !== '' 
      ? { id: String(payload.accountId) } 
      : null;
  }
  
  // Handle both "health" and "relationshipHealth" field names
  const healthValue = payload.relationshipHealth ?? payload.health;
  addIfNotEmpty('Relationship_Health', healthValue);
  
  if (payload.relationshipHealthScore !== undefined && payload.relationshipHealthScore !== null) {
    zohoPayload.Relationship_Health_Score = Number(payload.relationshipHealthScore);
  }

  const body = { data: [zohoPayload], trigger: [] };

  try {
    const response = await zohoRequest<{
      data?: { details?: { id: string }; status?: string; message?: string }[];
    }>(`/crm/v2/Contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const details = response.data?.[0];
    if (details?.status === 'error') {
      const errorMessage = details.message || 'Failed to update contact in Zoho';
      console.error('Zoho API error:', {
        id,
        payload: zohoPayload,
        error: errorMessage,
        fullResponse: response.data,
      });
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating contact in Zoho:', {
      id,
      payload: zohoPayload,
      body,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Also update in database if configured
  const supabase = getSupabase();
  if (supabase) {
    const dbPayload: Record<string, unknown> = {};
    if (payload.firstName !== undefined) dbPayload.first_name = payload.firstName || null;
    if (payload.lastName !== undefined) dbPayload.last_name = payload.lastName || null;
    if (payload.firstName !== undefined || payload.lastName !== undefined) {
      const firstName = String(payload.firstName ?? '');
      const lastName = String(payload.lastName ?? '');
      dbPayload.full_name = `${firstName} ${lastName}`.trim() || null;
    }
    if (payload.email !== undefined) dbPayload.email = payload.email || null;
    if (payload.phone !== undefined) dbPayload.phone = payload.phone || null;
    if (payload.mobile !== undefined) dbPayload.mobile = payload.mobile || null;
    if (payload.role !== undefined) dbPayload.role = payload.role || null;
    if (payload.type !== undefined) dbPayload.contact_type = payload.type || null;
    if (payload.territory !== undefined) dbPayload.territory = payload.territory || null;
    if (payload.notes !== undefined) dbPayload.description = payload.notes || null;
    if (payload.company !== undefined) dbPayload.company_name = payload.company || null;
    if (payload.accountId !== undefined) dbPayload.account_id = payload.accountId || null;
    // Handle both "health" and "relationshipHealth" field names
    const dbHealthValue = payload.relationshipHealth ?? payload.health;
    if (dbHealthValue !== undefined) dbPayload.relationship_health = dbHealthValue || null;
    if (payload.relationshipHealthScore !== undefined) {
      dbPayload.relationship_health_score = payload.relationshipHealthScore !== null 
        ? Number(payload.relationshipHealthScore) 
        : null;
    }

    await supabase.from('contacts').update(dbPayload).eq('zoho_id', id);
  }

  // Fetch and return the updated contact
  return getContactFromZoho(id);
}

async function deleteContactById(id: string) {
  // Delete from Zoho
  await zohoRequest(`/crm/v2/Contacts/${id}`, { method: 'DELETE' });

  // Also delete from database if configured
  const supabase = getSupabase();
  if (supabase) {
    await supabase.from('contacts').delete().eq('zoho_id', id);
  }
}

// =====================================================
// API HANDLER
// =====================================================

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

      // Try database first if configured
      if (isSupabaseConfigured()) {
        const dbResult = await listContactsFromDb(page, pageSize, typeFilter, healthFilter, query, companyFilter, sortBy, sortOrder);
        if (dbResult && dbResult.items.length > 0) {
          return res.status(200).json({
            items: dbResult.items,
            page,
            pageSize,
            total: dbResult.total,
            source: 'database',
          });
        }
      }

      // Fallback to Zoho API
      const zohoResult = await listContactsFromZoho(page, pageSize, typeFilter, healthFilter, query, companyFilter, sortBy, sortOrder);
      
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

// Export for use by [id].ts
export { updateContact, deleteContactById, getContactFromDb, getContactFromZoho, mapZohoContact };