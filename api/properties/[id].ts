import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured, DbProperty, DbUnit } from '../../lib/supabase.js';
import type { Property } from '../../../src/types/property';

// Helper to map DB property to Frontend Property
function mapProperty(p: DbProperty & { units?: DbUnit[] }): Property {
  return {
    id: p.id,
    name: p.name,
    addressLine: p.address_line || '',
    postcode: p.postcode || '',
    city: p.city || '',
    submarket: (() => {
      if (!p.submarket) return undefined;
      let clean = p.submarket.replace(/^"|"$/g, '').trim(); 
      if (clean.startsWith('["') && clean.endsWith('"]')) {
         clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith('[') && clean.endsWith(']')) {
         clean = clean.slice(1, -1).trim();
      }
      return clean || undefined;
    })(),
    country: p.country || 'United Kingdom',
    totalSizeSqFt: p.total_size_sqft || undefined,
    floorCount: p.floor_count || undefined,
    lifts: p.lifts || undefined,
    builtYear: p.built_year || undefined,
    refurbishedYear: p.refurbished_year || undefined,
    parking: p.parking || undefined,
    amenities: [],
    images: p.images || [],
    marketing: {
      visibility: (p.marketing_visibility as 'Private' | 'Public') || 'Private',
      status: (p.marketing_status as 'Draft' | 'Broker-Ready' | 'On Market') || 'Draft',
      fitOut: (p.marketing_fit_out as 'Shell' | 'Cat A' | 'Cat A+') || 'Shell',
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
      occupancyPct: 0,
      totalUnits: (p.units || []).length,
      available: (p.units || []).filter(u => u.status === 'Available').length,
      underOffer: (p.units || []).filter(u => u.status === 'Under Offer').length,
      let: (p.units || []).filter(u => u.status === 'Let').length,
    },
    updatedAt: p.updated_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const id = query.id as string;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  // GET /api/properties/:id
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('properties')
      .select('*, units(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching property:', error);
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = mapProperty(data as DbProperty & { units: DbUnit[] });
    return res.status(200).json(property);
  }

  // PATCH /api/properties/:id
  if (method === 'PATCH') {
    const payload = req.body;
    
    // Map frontend payload to DB fields
    const updates: Partial<DbProperty> = {};
    if (payload.name) updates.name = payload.name;
    if (payload.addressLine) updates.address_line = payload.addressLine;
    if (payload.postcode) updates.postcode = payload.postcode;
    if (payload.city) updates.city = payload.city;
    if (payload.totalSizeSqFt) updates.total_size_sqft = payload.totalSizeSqFt;
    if (payload.floorCount) updates.floor_count = payload.floorCount;
    if (payload.marketing) {
      if (payload.marketing.status) updates.marketing_status = payload.marketing.status;
      if (payload.marketing.visibility) updates.marketing_visibility = payload.marketing.visibility;
      if (payload.marketing.fitOut) updates.marketing_fit_out = payload.marketing.fitOut;
    }
    
    // ... add other fields as needed

    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      return res.status(500).json({ error: 'Failed to update property' });
    }

    // Return the updated property (we might need to re-fetch to get units, or return partial)
    // For simplicity, let's just return the updated property record mapped (missing units)
    // or re-fetch. Re-fetching is safer to match return type.
    const { data: refetched } = await supabase
        .from('properties')
        .select('*, units(*)')
        .eq('id', id)
        .single();
        
    return res.status(200).json(mapProperty(refetched as DbProperty & { units: DbUnit[] }));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
