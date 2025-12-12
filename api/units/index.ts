import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured, type DbUnit, type DbProperty } from '../lib/supabase.js';

type UnitStatus = 'Available' | 'Under Offer' | 'Let' | 'Closed' | string;
type UnitFitOut = 'Shell' | 'Cat A' | 'Cat A+' | string;
type UnitPipelineStage = 'New' | 'Viewing' | 'HoTs' | 'Legals' | 'Closed' | string;

export interface UnitResponse {
  id: string;
  code: string;
  floor?: string | null;
  sizeSqFt?: number | null;
  desks?: number | null;
  status?: UnitStatus | null;
  fitOut?: UnitFitOut | null;
  pricePsf?: number | null;
  pricePcm?: number | null;
  pipelineStage?: UnitPipelineStage | null;
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

function mapUnit(u: DbUnit & { property?: DbProperty | null }): UnitResponse {
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
  const { method } = req;

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

  const search = ((req.query.search as string) || '').trim();
  const status = ((req.query.status as string) || '').trim();
  const pipelineStage = ((req.query.pipelineStage as string) || '').trim();
  const fitOut = ((req.query.fitOut as string) || '').trim();
  const propertyId = ((req.query.propertyId as string) || '').trim(); // DB uuid

  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '25', 10);
  const sortBy = ((req.query.sortBy as string) || 'updated_at').trim();
  const sortOrder = ((req.query.sortOrder as string) || 'desc').trim();

  // PostgREST relationship: units.property_zoho_id -> properties.zoho_id
  // Constraint is created by Postgres as `units_property_zoho_id_fkey`
  // We'll use an explicit relationship selector to be robust.
  let query = supabase
    .from('units')
    .select(
      `*,
       property:properties!units_property_zoho_id_fkey(
         id, zoho_id, name, address_line, city, postcode, country
       )`,
      { count: 'exact' }
    );

  if (search) {
    // Search unit code OR property name/address fields
    query = query.or(
      [
        `code.ilike.%${search}%`,
        `floor.ilike.%${search}%`,
        `property.name.ilike.%${search}%`,
        `property.address_line.ilike.%${search}%`,
        `property.city.ilike.%${search}%`,
        `property.postcode.ilike.%${search}%`,
      ].join(',')
    );
  }
  if (status) query = query.eq('status', status);
  if (pipelineStage) query = query.eq('pipeline_stage', pipelineStage);
  if (fitOut) query = query.eq('fit_out', fitOut);
  if (propertyId) query = query.eq('property.id', propertyId);

  const dbSortBy = sortBy === 'updatedAt' ? 'updated_at' : sortBy;
  query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error('Error fetching units:', error);
    return res.status(500).json({ error: 'Failed to fetch units' });
  }

  const units = (data as (DbUnit & { property: DbProperty | null })[]).map(mapUnit);
  return res.status(200).json({ units, total: count || 0, page, limit });
}


