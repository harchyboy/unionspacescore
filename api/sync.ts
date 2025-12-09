import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from './_lib/supabase';
import { zohoRequest, ZohoContactRecord, ZohoAccountRecord } from './_lib/zoho';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    const contactsToUpsert = zohoContacts.map((c) => ({
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
      contact_type: c.Contact_Type || 'Broker',
      territory: c.Territory || c.Mailing_City || null,
      relationship_health: c.Relationship_Health || 'good',
      relationship_health_score: c.Relationship_Health_Score || null,
      description: c.Description || null,
      zoho_created_at: c.Created_Time || null,
      zoho_modified_at: c.Modified_Time || null,
    }));

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

  const { count: contactCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true });

  const { count: accountCount } = await supabase
    .from('accounts')
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
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check for API key (simple auth for sync endpoint)
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const expectedKey = process.env.SYNC_API_KEY;
  
  if (expectedKey && apiKey !== expectedKey) {
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

      const results: { contacts?: { synced: number }; accounts?: { synced: number } } = {};

      if (entity === 'contacts' || entity === 'all') {
        console.log('Starting contacts sync...');
        results.contacts = await syncContacts();
      }

      if (entity === 'accounts' || entity === 'all') {
        console.log('Starting accounts sync...');
        results.accounts = await syncAccounts();
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
    return res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

