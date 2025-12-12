import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured, type DbUnit, type DbProperty } from '../lib/supabase.js';

export interface UnitDetailsResponse {
  id: string;
  code: string;
  floor?: string | null;
  sizeSqFt?: number | null;
  desks?: number | null;
  status?: string | null;
  fitOut?: string | null;
  pricePsf?: number | null;
  pricePcm?: number | null;
  pipelineStage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  zohoCreatedAt?: string | null;
  zohoModifiedAt?: string | null;
  property?: {
    id: string;
    zohoId: string;
    name: string;
    addressLine?: string | null;
    city?: string | null;
    postcode?: string | null;
    country?: string | null;
  } | null;
}

function mapUnit(u: DbUnit & { property?: DbProperty | null }): UnitDetailsResponse {
  return {
    id: u.id,
    code: u.code,
    floor: u.floor ?? null,
    sizeSqFt: u.size_sqft ?? null,
    desks: u.desks ?? null,
    status: u.status ?? null,
    fitOut: u.fit_out ?? null,
    pricePsf: u.price_psf ?? null,
    pricePcm: u.price_pcm ?? null,
    pipelineStage: u.pipeline_stage ?? null,
    createdAt: u.created_at ?? null,
    updatedAt: u.updated_at ?? null,
    zohoCreatedAt: u.zoho_created_at ?? null,
    zohoModifiedAt: u.zoho_modified_at ?? null,
    property: u.property
      ? {
          id: u.property.id,
          zohoId: u.property.zoho_id,
          name: u.property.name,
          addressLine: u.property.address_line ?? null,
          city: u.property.city ?? null,
          postcode: u.property.postcode ?? null,
          country: u.property.country ?? null,
        }
      : null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const id = query.id as string;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('units')
    .select(
      `*,
       property:properties!units_property_zoho_id_fkey(
         id, zoho_id, name, address_line, city, postcode, country
       )`
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching unit:', error);
    return res.status(404).json({ error: 'Unit not found' });
  }

  return res.status(200).json(mapUnit(data as DbUnit & { property: DbProperty | null }));
}


