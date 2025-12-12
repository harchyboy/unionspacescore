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
    let rawStats: { submarket: string; count: number }[] = [];

    // Attempt RPC first
    const { data: rpcStats, error: statsError } = await supabase.rpc('get_submarket_stats');
    
    if (!statsError && rpcStats && rpcStats.length > 0) {
      rawStats = rpcStats;
    } else {
      console.warn('RPC get_submarket_stats failed or empty, falling back to JS aggregation', statsError);
      
      // Fallback: Fetch all submarkets and aggregate
      const { data: allProperties, error } = await supabase
        .from('properties')
        .select('submarket');
      
      if (error) {
        console.error('Error fetching properties for submarkets:', error);
        return res.status(500).json({ error: 'Failed to fetch submarkets' });
      }

      if (allProperties) {
         const tempMap = new Map<string, number>();
         allProperties.forEach(p => {
            const val = p.submarket || 'Unknown';
            tempMap.set(val, (tempMap.get(val) || 0) + 1);
         });
         rawStats = Array.from(tempMap.entries()).map(([submarket, count]) => ({ submarket, count }));
      }
    }
    
    // Process and Clean Stats (Merging duplicates after cleaning)
    const mergedStatsMap = new Map<string, number>();
    
    rawStats.forEach(stat => {
        const raw = stat.submarket;
        let values: string[] = [];

        // Check if string looks like a JSON array
        const trimmed = raw.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
             const parsed = JSON.parse(trimmed);
             if (Array.isArray(parsed)) {
               values = parsed.map(v => String(v).trim());
             } else {
               values = [trimmed];
             }
          } catch (e) {
             // Failed to parse, treat as literal string
             values = [trimmed];
          }
        } else {
          values = [trimmed];
        }

        values.forEach(v => {
          // Clean up any remaining artifacts
          let clean = v.replace(/^"|"$/g, '').trim(); 
          if (clean.startsWith('["') && clean.endsWith('"]')) {
             clean = clean.slice(2, -2).trim();
          } else if (clean.startsWith('[') && clean.endsWith(']')) {
             clean = clean.slice(1, -1).trim();
          }
          
          if (clean) {
             mergedStatsMap.set(clean, (mergedStatsMap.get(clean) || 0) + stat.count);
          }
        });
    });

    const submarketStats = Array.from(mergedStatsMap.entries())
      .map(([submarket, count]) => ({ submarket, count }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json(submarketStats);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

