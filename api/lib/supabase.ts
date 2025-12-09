import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface DbContact {
  id: string;
  zoho_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  role: string | null;
  company_name: string | null;
  account_id: string | null;
  contact_type: string | null;
  territory: string | null;
  relationship_health: string | null;
  relationship_health_score: number | null;
  description: string | null;
  linkedin_url: string | null;
  enrichment_status: string | null;
  enriched_at: string | null;
  zoho_created_at: string | null;
  zoho_modified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAccount {
  id: string;
  zoho_id: string;
  name: string;
  account_type: string | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  website: string | null;
  phone: string | null;
  employee_count: number | null;
  annual_revenue: number | null;
  description: string | null;
  zoho_created_at: string | null;
  zoho_modified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSyncStatus {
  id: string;
  entity_type: 'contacts' | 'accounts';
  last_sync_at: string;
  records_synced: number;
  status: 'success' | 'error' | 'in_progress';
  error_message: string | null;
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured - falling back to direct Zoho API');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

