import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from './lib/supabase.js';
import { zohoRequest, ZohoContactRecord, ZohoAccountRecord, ZohoPropertyRecord, ZohoUnitRecord } from './lib/zoho.js';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Fetch all properties from Zoho (paginated)
async function fetchAllZohoProperties(): Promise<ZohoPropertyRecord[]> {
  const allProperties: ZohoPropertyRecord[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await zohoRequest<{
      data?: ZohoPropertyRecord[];
      info?: { more_records?: boolean };
    }>(`/crm/v2/Properties?page=${page}&per_page=200`); // Assuming 'Properties' module

    const records = response.data ?? [];
    allProperties.push(...records);
    hasMore = response.info?.more_records ?? false;
    page++;

    if (page > 100) break;
  }

  return allProperties;
}

// Fetch all units from Zoho (paginated)
async function fetchAllZohoUnits(): Promise<ZohoUnitRecord[]> {
  const allUnits: ZohoUnitRecord[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await zohoRequest<{
      data?: ZohoUnitRecord[];
      info?: { more_records?: boolean };
    }>(`/crm/v2/Units?page=${page}&per_page=200`); // Assuming 'Units' module

    const records = response.data ?? [];
    allUnits.push(...records);
    hasMore = response.info?.more_records ?? false;
    page++;

    if (page > 100) break;
  }

  return allUnits;
}

// Fetch all contacts from Zoho (paginated)
async function fetchAllZohoContacts(): Promise<ZohoContactRecord[]> {
  const allContacts: ZohoContactRecord[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await zohoRequest<{
      data?: ZohoContactRecord[];
      info?: { more_records?: boolean };
    }>(`/crm/v2/Contacts?page=${page}&per_page=200`);

    const records = response.data ?? [];
    allContacts.push(...records);
    hasMore = response.info?.more_records ?? false;
    page++;

    // Safety limit
    if (page > 100) break;
  }

  return allContacts;
}

// Fetch all accounts from Zoho (paginated)
async function fetchAllZohoAccounts(): Promise<ZohoAccountRecord[]> {
  const allAccounts: ZohoAccountRecord[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await zohoRequest<{
      data?: ZohoAccountRecord[];
      info?: { more_records?: boolean };
    }>(`/crm/v2/Accounts?page=${page}&per_page=200`);

    const records = response.data ?? [];
    allAccounts.push(...records);
    hasMore = response.info?.more_records ?? false;
    page++;

    // Safety limit
    if (page > 100) break;
  }

  return allAccounts;
}

// Sync properties from Zoho to Supabase
async function syncProperties() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  await supabase.from('sync_status').insert({
    entity_type: 'properties',
    status: 'in_progress',
    records_synced: 0,
  });

  try {
    const zohoProperties = await fetchAllZohoProperties();
    console.log(`Fetched ${zohoProperties.length} properties from Zoho`);

    const propertiesToUpsert = zohoProperties.map((p) => ({
      zoho_id: p.id,
      name: p.Name || 'Unnamed Property',
      address_line: p.Address_Line || null,
      postcode: p.Postcode || null,
      city: p.City || null,
      submarket: p.Submarket || null,
      country: p.Country || 'United Kingdom',
      total_size_sqft: p.Total_Size_Sq_Ft || null,
      floor_count: p.Floor_Count || null,
      lifts: p.Lifts || null,
      built_year: p.Built_Year || null,
      refurbished_year: p.Refurbished_Year || null,
      parking: p.Parking || null,
      marketing_status: p.Marketing_Status || 'Draft',
      marketing_visibility: p.Marketing_Visibility || 'Private',
      marketing_fit_out: p.Marketing_Fit_Out || null,
      epc_rating: p.EPC_Rating || null,
      epc_ref: p.EPC_Ref || null,
      epc_expiry: p.EPC_Expiry || null,
      breeam_rating: p.BREEAM_Rating || null,
      zoho_created_at: p.Created_Time || null,
      zoho_modified_at: p.Modified_Time || null,
    }));

    const chunkSize = 100;
    for (let i = 0; i < propertiesToUpsert.length; i += chunkSize) {
      const chunk = propertiesToUpsert.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('properties')
        .upsert(chunk, { onConflict: 'zoho_id' });
      
      if (error) {
        console.error('Error upserting properties chunk:', error);
        throw error;
      }
    }

    await supabase.from('sync_status').insert({
      entity_type: 'properties',
      status: 'success',
      records_synced: zohoProperties.length,
    });

    return { synced: zohoProperties.length };
  } catch (error) {
    await supabase.from('sync_status').insert({
      entity_type: 'properties',
      status: 'error',
      records_synced: 0,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Sync units from Zoho to Supabase
async function syncUnits() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  await supabase.from('sync_status').insert({
    entity_type: 'units',
    status: 'in_progress',
    records_synced: 0,
  });

  try {
    const zohoUnits = await fetchAllZohoUnits();
    console.log(`Fetched ${zohoUnits.length} units from Zoho`);

    // Only sync units that have a valid property link
    const unitsToUpsert = zohoUnits
      .filter(u => u.Property?.id) // Filter out units without a property link
      .map((u) => ({
        zoho_id: u.id,
        property_zoho_id: u.Property?.id,
        code: u.Name || 'Unnamed Unit',
        floor: u.Floor || null,
        size_sqft: u.Size_Sq_Ft || null,
        desks: u.Desks || null,
        status: u.Status || 'Available',
        fit_out: u.Fit_Out || null,
        price_psf: u.Price_Per_Sq_Ft || null,
        price_pcm: u.Price_Per_Month || null,
        pipeline_stage: u.Pipeline_Stage || null,
        zoho_created_at: u.Created_Time || null,
        zoho_modified_at: u.Modified_Time || null,
      }));

    const chunkSize = 100;
    for (let i = 0; i < unitsToUpsert.length; i += chunkSize) {
      const chunk = unitsToUpsert.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('units')
        .upsert(chunk, { onConflict: 'zoho_id' });
      
      if (error) {
        console.error('Error upserting units chunk:', error);
        throw error;
      }
    }

    await supabase.from('sync_status').insert({
      entity_type: 'units',
      status: 'success',
      records_synced: unitsToUpsert.length,
    });

    return { synced: unitsToUpsert.length };
  } catch (error) {
    await supabase.from('sync_status').insert({
      entity_type: 'units',
      status: 'error',
      records_synced: 0,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Sync contacts from Zoho to Supabase
async function syncContacts() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // Mark sync as in progress
  await supabase.from('sync_status').insert({
    entity_type: 'contacts',
    status: 'in_progress',
    records_synced: 0,
  });

  try {
    const zohoContacts = await fetchAllZohoContacts();
    console.log(`Fetched ${zohoContacts.length} contacts from Zoho`);

    // Upsert contacts into database
    const contactsToUpsert = zohoContacts.map((c) => {
      // Determine type: prefer Contact_Type field, fallback to Tag, default to Broker
      let type = c.Contact_Type;
      if (!type && Array.isArray(c.Tag)) {
        const tags = c.Tag as { name: string }[];
        // Check for known types in tags
        const typeTag = tags.find(t => 
          ['Broker', 'Disposal Agent', 'Tenant', 'Landlord', 'Supplier'].includes(t.name)
        );
        if (typeTag) {
          type = typeTag.name;
        }
      }

      return {
        zoho_id: c.id,
        first_name: c.First_Name || '',
        last_name: c.Last_Name || '',
        full_name: c.Full_Name || `${c.First_Name || ''} ${c.Last_Name || ''}`.trim() || 'Unnamed Contact',
        email: c.Email || '',
        phone: c.Phone || null,
        mobile: c.Mobile || null,
        role: c.Title || null,
        company_name: c.Account_Name?.name || null,
        account_id: c.Account_Name?.id || null,
        contact_type: type || 'Broker',
        territory: c.Territory || c.Mailing_City || null,
        relationship_health: c.Relationship_Health || 'good',
        relationship_health_score: c.Relationship_Health_Score || null,
        linkedin_url: c.LinkedIn_URL || null,
        description: c.Description || null,
        zoho_created_at: c.Created_Time || null,
        zoho_modified_at: c.Modified_Time || null,
      };
    });

    // Batch upsert in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < contactsToUpsert.length; i += chunkSize) {
      const chunk = contactsToUpsert.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('contacts')
        .upsert(chunk, { onConflict: 'zoho_id' });
      
      if (error) {
        console.error('Error upserting contacts chunk:', error);
        throw error;
      }
    }

    // Record successful sync
    await supabase.from('sync_status').insert({
      entity_type: 'contacts',
      status: 'success',
      records_synced: zohoContacts.length,
    });

    return { synced: zohoContacts.length };
  } catch (error) {
    // Record failed sync
    await supabase.from('sync_status').insert({
      entity_type: 'contacts',
      status: 'error',
      records_synced: 0,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Sync accounts from Zoho to Supabase
async function syncAccounts() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // Mark sync as in progress
  await supabase.from('sync_status').insert({
    entity_type: 'accounts',
    status: 'in_progress',
    records_synced: 0,
  });

  try {
    const zohoAccounts = await fetchAllZohoAccounts();
    console.log(`Fetched ${zohoAccounts.length} accounts from Zoho`);

    // Upsert accounts into database
    const accountsToUpsert = zohoAccounts.map((a) => ({
      zoho_id: a.id,
      name: a.Account_Name || 'Unnamed Account',
      account_type: a.Account_Type || null,
      industry: a.Industry || null,
      address: a.Billing_Street || null,
      city: a.Billing_City || null,
      postcode: a.Billing_Code || null,
      country: a.Billing_Country || null,
      website: a.Website || null,
      phone: a.Phone || null,
      employee_count: a.Employees || null,
      annual_revenue: a.Annual_Revenue || null,
      description: a.Description || null,
      zoho_created_at: a.Created_Time || null,
      zoho_modified_at: a.Modified_Time || null,
    }));

    // Batch upsert in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < accountsToUpsert.length; i += chunkSize) {
      const chunk = accountsToUpsert.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('accounts')
        .upsert(chunk, { onConflict: 'zoho_id' });
      
      if (error) {
        console.error('Error upserting accounts chunk:', error);
        throw error;
      }
    }

    // Record successful sync
    await supabase.from('sync_status').insert({
      entity_type: 'accounts',
      status: 'success',
      records_synced: zohoAccounts.length,
    });

    return { synced: zohoAccounts.length };
  } catch (error) {
    // Record failed sync
    await supabase.from('sync_status').insert({
      entity_type: 'accounts',
      status: 'error',
      records_synced: 0,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Get sync status
async function getSyncStatus() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data: contacts } = await supabase
    .from('sync_status')
    .select('*')
    .eq('entity_type', 'contacts')
    .order('last_sync_at', { ascending: false })
    .limit(1)
    .single();

  const { data: accounts } = await supabase
    .from('sync_status')
    .select('*')
    .eq('entity_type', 'accounts')
    .order('last_sync_at', { ascending: false })
    .limit(1)
    .single();

  const { data: properties } = await supabase
    .from('sync_status')
    .select('*')
    .eq('entity_type', 'properties')
    .order('last_sync_at', { ascending: false })
    .limit(1)
    .single();

  const { data: units } = await supabase
    .from('sync_status')
    .select('*')
    .eq('entity_type', 'units')
    .order('last_sync_at', { ascending: false })
    .limit(1)
    .single();

  const { count: contactCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true });

  const { count: accountCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true });

  const { count: propertyCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  const { count: unitCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true });

  return {
    contacts: {
      lastSync: contacts?.last_sync_at,
      status: contacts?.status,
      recordsInDb: contactCount ?? 0,
    },
    accounts: {
      lastSync: accounts?.last_sync_at,
      status: accounts?.status,
      recordsInDb: accountCount ?? 0,
    },
    properties: {
      lastSync: properties?.last_sync_at,
      status: properties?.status,
      recordsInDb: propertyCount ?? 0,
    },
    units: {
      lastSync: units?.last_sync_at,
      status: units?.status,
      recordsInDb: unitCount ?? 0,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check for API key (simple auth for sync endpoint)
  // Skip auth for POST requests from browser (Sync button)
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const expectedKey = process.env.SYNC_API_KEY;
  
  // Only enforce API key for cron jobs (which use query param), not manual browser clicks
  if (expectedKey && apiKey && apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ 
      error: 'Database not configured',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
    });
  }

  try {
    if (req.method === 'GET') {
      // Get sync status
      const status = await getSyncStatus();
      return res.status(200).json(status);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      const entity = body?.entity || 'all';

      const results: { contacts?: { synced: number }; accounts?: { synced: number }; properties?: { synced: number }; units?: { synced: number } } = {};

      if (entity === 'contacts' || entity === 'all') {
        console.log('Starting contacts sync...');
        results.contacts = await syncContacts();
      }

      if (entity === 'accounts' || entity === 'all') {
        console.log('Starting accounts sync...');
        results.accounts = await syncAccounts();
      }

      if (entity === 'properties' || entity === 'all') {
        console.log('Starting properties sync...');
        results.properties = await syncProperties();
      }

      if (entity === 'units' || entity === 'all') {
        console.log('Starting units sync...');
        results.units = await syncUnits();
      }

      return res.status(200).json({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sync error:', error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message)
        : typeof error === 'string'
        ? error
        : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    const details =
      typeof error === 'object' && error !== null
        ? JSON.stringify(error, Object.getOwnPropertyNames(error))
        : undefined;
    return res.status(500).json({
      error: 'Sync failed',
      message,
      details,
      stack,
    });
  }
}

