import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (method === 'GET') {
    // Attempt RPC first
    const { data: rpcStats, error: statsError } = await supabase.rpc('get_submarket_stats');
    
    if (!statsError && rpcStats && rpcStats.length > 0) {
      return res.status(200).json(rpcStats);
    } 
    
    console.warn('RPC get_submarket_stats failed or empty, falling back to JS aggregation', statsError);
    
    // Fallback: Fetch all submarkets and aggregate
    const { data: allProperties, error } = await supabase
      .from('properties')
      .select('submarket');
    
    if (error) {
      console.error('Error fetching properties for submarkets:', error);
      return res.status(500).json({ error: 'Failed to fetch submarkets' });
    }
    
    let submarketStats: { submarket: string; count: number }[] = [];
    
    if (allProperties) {
      const statsMap = new Map<string, number>();
      allProperties.forEach(p => {
        // Normalize submarket: handle null/undefined as 'Unknown'
        const sm = p.submarket ? p.submarket.trim() : 'Unknown';
        // If empty string, treat as Unknown
        const key = sm || 'Unknown';
        statsMap.set(key, (statsMap.get(key) || 0) + 1);
      });
      
      submarketStats = Array.from(statsMap.entries())
        .map(([submarket, count]) => ({ submarket, count }))
        .sort((a, b) => b.count - a.count);
    }

    return res.status(200).json(submarketStats);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

