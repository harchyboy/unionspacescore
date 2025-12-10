
import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'professional-network-data.p.rapidapi.com';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function extractUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^/]+)/);
  return match ? match[1] : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query as { url?: string };
  const linkedinUrl = url || (req.body && req.body.url);

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

  try {
    // Note: Endpoint might vary based on specific API subscription. 
    // trying /get-profile-posts which is common for this API provider
    const apiUrl = `https://${RAPIDAPI_HOST}/get-profile-posts?username=${encodeURIComponent(username)}`;
    console.log(`Fetching posts for ${username} from ${apiUrl}`);

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
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('LinkedIn posts error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

