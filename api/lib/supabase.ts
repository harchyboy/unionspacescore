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
  entity_type: 'contacts' | 'accounts' | 'properties' | 'units';
  last_sync_at: string;
  records_synced: number;
  status: 'success' | 'error' | 'in_progress';
  error_message: string | null;
}

export interface DbProperty {
  id: string;
  zoho_id: string;
  name: string;
  address_line: string | null;
  postcode: string | null;
  city: string | null;
  submarket: string | null;
  images: string[] | null;
  documents: { name: string; url: string; type: string; uploaded_at: string }[] | null;
  country: string | null;
  total_size_sqft: number | null;
  floor_count: number | null;
  lifts: string | null;
  built_year: number | null;
  refurbished_year: number | null;
  parking: string | null;
  marketing_status: string | null;
  marketing_visibility: string | null;
  marketing_fit_out: string | null;
  epc_rating: string | null;
  epc_ref: string | null;
  epc_expiry: string | null;
  breeam_rating: string | null;
  zoho_created_at: string | null;
  zoho_modified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbUnit {
  id: string;
  zoho_id: string;
  property_zoho_id: string | null;
  code: string;
  floor: string | null;
  size_sqft: number | null;
  desks: number | null;
  status: string | null;
  fit_out: string | null;
  price_psf: number | null;
  price_pcm: number | null;
  pipeline_stage: string | null;
  zoho_created_at: string | null;
  zoho_modified_at: string | null;
  created_at: string;
  updated_at: string;
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

