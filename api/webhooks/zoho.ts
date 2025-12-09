import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from '../_lib/supabase';
import { zohoRequest, ZohoContactRecord, ZohoAccountRecord } from '../_lib/zoho';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Zoho-Webhook-Signature');
}

// Zoho webhook payload types
interface ZohoWebhookPayload {
  module?: string;
  operation?: string; // create, update, delete
  ids?: string[];
  data?: Record<string, unknown>[];
  // Some webhooks send channel info
  channel_id?: string;
  notification_type?: string;
}

// Fetch a single contact from Zoho by ID
async function fetchZohoContact(id: string): Promise<ZohoContactRecord | null> {
  try {
    const response = await zohoRequest<{ data?: ZohoContactRecord[] }>(
      `/crm/v2/Contacts/${id}`
    );
    return response.data?.[0] ?? null;
  } catch (error) {
    console.error(`Failed to fetch contact ${id}:`, error);
    return null;
  }
}

// Fetch a single account from Zoho by ID
async function fetchZohoAccount(id: string): Promise<ZohoAccountRecord | null> {
  try {
    const response = await zohoRequest<{ data?: ZohoAccountRecord[] }>(
      `/crm/v2/Accounts/${id}`
    );
    return response.data?.[0] ?? null;
  } catch (error) {
    console.error(`Failed to fetch account ${id}:`, error);
    return null;
  }
}

// Handle contact create/update
async function upsertContact(zohoContact: ZohoContactRecord) {
  const supabase = getSupabase();
  if (!supabase) return;

  const contact = {
    zoho_id: zohoContact.id,
    first_name: zohoContact.First_Name || '',
    last_name: zohoContact.Last_Name || '',
    full_name: zohoContact.Full_Name || `${zohoContact.First_Name || ''} ${zohoContact.Last_Name || ''}`.trim() || 'Unnamed Contact',
    email: zohoContact.Email || '',
    phone: zohoContact.Phone || null,
    mobile: zohoContact.Mobile || null,
    role: zohoContact.Title || null,
    company_name: zohoContact.Account_Name?.name || null,
    account_id: zohoContact.Account_Name?.id || null,
    contact_type: zohoContact.Contact_Type || 'Broker',
    territory: zohoContact.Territory || zohoContact.Mailing_City || null,
    relationship_health: zohoContact.Relationship_Health || 'good',
    relationship_health_score: zohoContact.Relationship_Health_Score || null,
    description: zohoContact.Description || null,
    zoho_created_at: zohoContact.Created_Time || null,
    zoho_modified_at: zohoContact.Modified_Time || null,
  };

  const { error } = await supabase
    .from('contacts')
    .upsert(contact, { onConflict: 'zoho_id' });

  if (error) {
    console.error('Error upserting contact:', error);
    throw error;
  }
}

// Handle account create/update
async function upsertAccount(zohoAccount: ZohoAccountRecord) {
  const supabase = getSupabase();
  if (!supabase) return;

  const account = {
    zoho_id: zohoAccount.id,
    name: zohoAccount.Account_Name || 'Unnamed Account',
    account_type: zohoAccount.Account_Type || null,
    industry: zohoAccount.Industry || null,
    address: zohoAccount.Billing_Street || null,
    city: zohoAccount.Billing_City || null,
    postcode: zohoAccount.Billing_Code || null,
    country: zohoAccount.Billing_Country || null,
    website: zohoAccount.Website || null,
    phone: zohoAccount.Phone || null,
    employee_count: zohoAccount.Employees || null,
    annual_revenue: zohoAccount.Annual_Revenue || null,
    description: zohoAccount.Description || null,
    zoho_created_at: zohoAccount.Created_Time || null,
    zoho_modified_at: zohoAccount.Modified_Time || null,
  };

  const { error } = await supabase
    .from('accounts')
    .upsert(account, { onConflict: 'zoho_id' });

  if (error) {
    console.error('Error upserting account:', error);
    throw error;
  }
}

// Handle contact delete
async function deleteContact(zohoId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('zoho_id', zohoId);

  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

// Handle account delete
async function deleteAccount(zohoId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('zoho_id', zohoId);

  if (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// Log webhook event
async function logWebhook(
  module: string,
  eventType: string,
  zohoId: string,
  payload: unknown,
  status: 'success' | 'error',
  errorMessage?: string
) {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from('webhook_logs').insert({
    module,
    event_type: eventType,
    zoho_id: zohoId,
    payload: payload as Record<string, unknown>,
    status,
    error_message: errorMessage || null,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ 
      error: 'Database not configured',
      message: 'Webhook received but cannot process without database'
    });
  }

  // Optional: Verify webhook signature
  // const signature = req.headers['x-zoho-webhook-signature'];
  // if (!verifyWebhookSignature(signature, req.body)) {
  //   return res.status(401).json({ error: 'Invalid signature' });
  // }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const payload = body as ZohoWebhookPayload;
    
    console.log('Received Zoho webhook:', JSON.stringify(payload, null, 2));

    const module = payload.module?.toLowerCase();
    const operation = payload.operation?.toLowerCase();
    const ids = payload.ids || [];

    // Handle based on module and operation
    if (module === 'contacts') {
      for (const id of ids) {
        try {
          if (operation === 'delete') {
            await deleteContact(id);
            await logWebhook('Contacts', 'delete', id, payload, 'success');
          } else {
            // For create/update, fetch fresh data from Zoho
            const contact = await fetchZohoContact(id);
            if (contact) {
              await upsertContact(contact);
              await logWebhook('Contacts', operation || 'update', id, payload, 'success');
            }
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          await logWebhook('Contacts', operation || 'unknown', id, payload, 'error', msg);
        }
      }
    } else if (module === 'accounts') {
      for (const id of ids) {
        try {
          if (operation === 'delete') {
            await deleteAccount(id);
            await logWebhook('Accounts', 'delete', id, payload, 'success');
          } else {
            // For create/update, fetch fresh data from Zoho
            const account = await fetchZohoAccount(id);
            if (account) {
              await upsertAccount(account);
              await logWebhook('Accounts', operation || 'update', id, payload, 'success');
            }
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          await logWebhook('Accounts', operation || 'unknown', id, payload, 'error', msg);
        }
      }
    } else {
      console.log(`Ignoring webhook for module: ${module}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Webhook processed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

