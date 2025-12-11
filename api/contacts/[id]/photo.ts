import type { VercelRequest, VercelResponse } from '@vercel/node';
import { API_BASE, getZohoAccessToken } from '../../lib/zoho.js';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function fetchContactPhoto(id: string) {
  try {
    const token = await getZohoAccessToken();
    const response = await fetch(`${API_BASE}/crm/v2/Contacts/${id}/photo`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
    });

    // Zoho returns 204 when no photo is present
    if (response.status === 204) {
      return { status: 404 as const };
    }

    if (!response.ok) {
      return { status: response.status as const, error: await response.text() };
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());
    return { status: 200 as const, contentType, buffer };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes('too many requests') || message.toLowerCase().includes('access denied')) {
      return { status: 429 as const, error: 'Zoho rate limit: too many requests' };
    }
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Contact ID is required' });
  }

  try {
    const result = await fetchContactPhoto(id);

    if (result.status !== 200) {
      // Do not cache errors/missing images; allows retry when rate limit clears or photo is added
      res.setHeader('Cache-Control', 'no-store');
      const message =
        result.status === 429
          ? 'Photo temporarily unavailable (Zoho rate limit). Please retry shortly.'
          : 'Photo not found';
      return res.status(result.status).json({ message });
    }

    res.setHeader('Content-Type', result.contentType);
    // Allow short caching of successful images; clients revalidate via the cache-busting query param
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res.status(200).send(result.buffer);
  } catch (error) {
    console.error('Contact photo fetch error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ message });
  }
}
