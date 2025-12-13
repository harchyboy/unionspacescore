import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from './lib/supabase.js';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'professional-network-data.p.rapidapi.com';
const CACHE_DURATION_HOURS = 24;

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function extractUsername(url: string): string | null {
  // Handle: linkedin.com/in/username
  // Handle: linkedin.com/in/username/
  // Handle: www.linkedin.com/in/username
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
  return match ? match[1] : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, force } = req.query as { url?: string; force?: string };
  const linkedinUrl = url || (req.body && req.body.url);
  const forceRefresh = force === 'true';

  if (!linkedinUrl) {
    return res.status(400).json({ error: 'LinkedIn URL required' });
  }

  const username = extractUsername(linkedinUrl);
  if (!username) {
    return res.status(400).json({ error: 'Invalid LinkedIn URL' });
  }

  if (!RAPIDAPI_KEY) {
    return res.status(503).json({ error: 'RAPIDAPI_KEY not configured' });
  }

  const supabase = getSupabase();

  try {
    // 1. Check cache if database is available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let previousPosts: any[] = [];
    let hasPreviousSync = false;

    if (supabase) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('id, linkedin_posts_data, linkedin_posts_fetched_at')
        .eq('linkedin_url', linkedinUrl) // We match by exact URL string as stored
        .single();

      if (contact) {
        if (contact.linkedin_posts_fetched_at) {
             hasPreviousSync = true;
             // distinct handling if data is just the array or object with data
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const rawData = contact.linkedin_posts_data as any;
             previousPosts = Array.isArray(rawData) ? rawData : (rawData?.data || []);
        }

        if (contact.linkedin_posts_data && !forceRefresh) {
          const lastFetched = new Date(contact.linkedin_posts_fetched_at);
          const now = new Date();
          const diffHours = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);

          if (diffHours < CACHE_DURATION_HOURS) {
            console.log(`[LinkedIn Posts] Serving cached posts for ${username} (Age: ${diffHours.toFixed(1)}h)`);
            return res.status(200).json({ 
              success: true, 
              data: contact.linkedin_posts_data, 
              cached: true, 
              lastFetched: contact.linkedin_posts_fetched_at,
              newPostsCount: 0 
            });
          }
        }
      }
    }

    // 2. Fetch from RapidAPI
    // Note: Endpoint might vary based on specific API subscription. 
    // trying /get-profile-posts which is common for this API provider
    const apiUrl = `https://${RAPIDAPI_HOST}/get-profile-posts?username=${encodeURIComponent(username)}`;
    console.log(`[LinkedIn Posts] Fetching posts for ${username} from API`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('LinkedIn API error:', text);
      return res.status(response.status).json({ error: 'Failed to fetch posts', details: text });
    }

    const data = await response.json();
    
    // 3. Calculate new posts count
    let newPostsCount = 0;
    if (hasPreviousSync) {
        const newPosts = Array.isArray(data) ? data : (data.data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prevUrls = new Set(previousPosts.map((p: any) => p.url || p.link || p.articleUrl));
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newPostsCount = newPosts.filter((p: any) => {
             const url = p.url || p.link || p.articleUrl;
             // valid post with url that we haven't seen
             return url && !prevUrls.has(url);
        }).length;
        
        if (newPostsCount > 0) {
            console.log(`[LinkedIn Posts] Found ${newPostsCount} new posts for ${username}`);
        }
    }

    // 4. Update cache
    if (supabase) {
      // Find contact to update (we might need to search by partial URL match if exact match failed above, but sticking to exact for safety)
      // Actually, let's just try to update any contact with this URL
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          linkedin_posts_data: data,
          linkedin_posts_fetched_at: new Date().toISOString()
        })
        .eq('linkedin_url', linkedinUrl);

      if (updateError) {
        console.warn('[LinkedIn Posts] Failed to update cache:', updateError);
      } else {
        console.log(`[LinkedIn Posts] Cache updated for ${username}`);
      }
    }

    return res.status(200).json({ 
      success: true, 
      data, 
      cached: false, 
      lastFetched: new Date().toISOString(),
      newPostsCount
    });

  } catch (error) {
    console.error('LinkedIn posts error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
