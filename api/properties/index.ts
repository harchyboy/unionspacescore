import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured, DbProperty, DbUnit } from '../lib/supabase.js';
import type { Property } from '../_lib/types';

// Helper to map DB property to Frontend Property
function mapProperty(p: DbProperty & { units?: DbUnit[] }): Property {
  return {
    id: p.id,
    name: p.name,
    addressLine: p.address_line || '',
    postcode: p.postcode || '',
    city: p.city || '',
    country: p.country || 'United Kingdom',
    totalSizeSqFt: p.total_size_sqft || undefined,
    floorCount: p.floor_count || undefined,
    lifts: p.lifts || undefined,
    builtYear: p.built_year || undefined,
    refurbishedYear: p.refurbished_year || undefined,
    parking: p.parking || undefined,
    amenities: [], // TODO: store amenities in DB
    marketing: {
      visibility: (p.marketing_visibility as 'Private' | 'Public') || 'Private',
      status: (p.marketing_status as 'Draft' | 'Broker-Ready' | 'On Market') || 'Draft',
      fitOut: (p.marketing_fit_out as 'Shell' | 'Cat A' | 'Cat A+') || 'Shell',
      // valveSyncStatus?
    },
    compliance: {
      epc: p.epc_rating ? {
        rating: p.epc_rating,
        ref: p.epc_ref || undefined,
        expires: p.epc_expiry || undefined,
      } : undefined,
      breeam: p.breeam_rating || undefined,
    },
    units: (p.units || []).map(u => ({
      id: u.id,
      code: u.code,
      floor: u.floor || '',
      sizeSqFt: u.size_sqft || 0,
      desks: u.desks || 0,
      fitOut: (u.fit_out as 'Shell' | 'Cat A' | 'Cat A+') || 'Shell',
      status: (u.status as 'Available' | 'Under Offer' | 'Let' | 'Closed') || 'Available',
      pricePsf: u.price_psf || undefined,
      pricePcm: u.price_pcm || undefined,
      pipelineStage: (u.pipeline_stage as 'New' | 'Viewing' | 'HoTs' | 'Legals' | 'Closed') || 'New',
    })),
    stats: {
      occupancyPct: 0, // TODO: calculate
      totalUnits: (p.units || []).length,
      available: (p.units || []).filter(u => u.status === 'Available').length,
      underOffer: (p.units || []).filter(u => u.status === 'Under Offer').length,
      let: (p.units || []).filter(u => u.status === 'Let').length,
    },
    updatedAt: p.updated_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    // Fallback to empty list if DB not configured, or maybe mock data?
    // For now, let's return error or empty to indicate move to DB
    return res.status(503).json({ error: 'Database not configured' });
  }

  // GET /api/properties - List properties
  if (method === 'GET') {
    const search = (req.query.search as string)?.toLowerCase() || '';
    const marketingStatus = (req.query.marketingStatus as string) || '';
    const visibility = (req.query.visibility as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const sortBy = (req.query.sortBy as string) || 'updated_at';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    let query = supabase
      .from('properties')
      .select('*, units(*)', { count: 'exact' });

    // Filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,address_line.ilike.%${search}%`);
    }
    if (marketingStatus) {
      query = query.eq('marketing_status', marketingStatus);
    }
    if (visibility) {
      query = query.eq('marketing_visibility', visibility);
    }

    // Sorting
    // Map frontend sort keys to DB keys
    const dbSortBy = sortBy === 'updatedAt' ? 'updated_at' : sortBy;
    query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }

    const properties = (data as (DbProperty & { units: DbUnit[] })[]).map(mapProperty);

    return res.status(200).json({
      properties,
      total: count || 0,
      page,
      limit,
    });
  }

  // POST /api/properties - Create property (TODO: Implement creation logic if needed to sync back to Zoho or local only)
  if (method === 'POST') {
    // For now, return 501 Not Implemented or stick to mock if needed.
    // Given the requirement is to "connect properties from application to properties in Zoho", 
    // maybe we should allow creation and sync to Zoho?
    // For this step, I'll focus on reading.
    return res.status(501).json({ error: 'Not implemented yet' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
