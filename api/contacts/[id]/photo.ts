import type { VercelRequest, VercelResponse } from '@vercel/node';
import { API_BASE, getZohoAccessToken } from '../../lib/zoho.js';
import { getSupabase } from '../../lib/supabase.js';

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
      return { status: response.status, error: await response.text() };
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

  const { id, t } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Contact ID is required' });
  }

  const supabase = getSupabase();
  const filePath = `contacts/${id}`;

  try {
    // 1. Try to serve from Supabase Storage first
    if (supabase) {
      let shouldServeFromCache = true;

      // If client provided a timestamp (record modification time), check if cache is stale
      // This handles the "User updated photo in Zoho" case
      if (t) {
        const recordModTime = Number(t);
        if (Number.isFinite(recordModTime)) {
          // Check file metadata to see if it's older than the record
          const { data: listData } = await supabase.storage
            .from('property-files')
            .list('contacts', { search: id, limit: 10 }); // limit 10 to be safe with partial matches

          const fileMeta = listData?.find(f => f.name === id);
          
          if (fileMeta && fileMeta.updated_at) {
            const fileModTime = new Date(fileMeta.updated_at).getTime();
            // If file is older than the record modification (minus 1 min buffer), it's stale
            if (fileModTime < recordModTime - 60000) {
              console.log(`[Photo] Cache stale for ${id}. File: ${fileMeta.updated_at}, Record param: ${t}`);
              shouldServeFromCache = false;
            }
          }
        }
      }

      if (shouldServeFromCache) {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('property-files')
          .download(filePath);

        if (!fileError && fileData) {
          // Found in Supabase, serve it
          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Determine content type (default to jpeg if unknown)
          const contentType = fileData.type || 'image/jpeg';
          
          res.setHeader('Content-Type', contentType);
          // Allow caching but require revalidation if 't' changes
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
          return res.status(200).send(buffer);
        }
      }
    }

    // 2. If not in Supabase (or stale), fetch from Zoho
    console.log(`[Photo] Fetching from Zoho for ${id}...`);
    const result = await fetchContactPhoto(id);

    if (!('buffer' in result)) {
      // Zoho failed or returned 404.
      // If we had a "stale" file in Supabase, we should probably serve it as a fallback
      // because it's better than nothing.
      if (!shouldServeFromCache && supabase) {
         console.log(`[Photo] Zoho returned ${result.status}, falling back to 'stale' Supabase file for ${id}`);
         const { data: fileData, error: fileError } = await supabase.storage
          .from('property-files')
          .download(filePath);

        if (!fileError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = fileData.type || 'image/jpeg';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
          return res.status(200).send(buffer);
        }
      }

      // Do not cache errors/missing images; allows retry when rate limit clears or photo is added
      res.setHeader('Cache-Control', 'no-store');
      let message = 'Photo not found';
      
      if (result.status === 429) {
        message = 'Photo temporarily unavailable (Zoho rate limit). Please retry shortly.';
      } else if ('error' in result && result.error) {
         // If it's the dynamic error object
         message = typeof result.error === 'string' ? result.error : 'Photo not found';
      }

      return res.status(result.status).json({ message });
    }

    // 3. Save to Supabase Storage for next time
    if (supabase) {
      try {
        console.log(`[Photo] Caching contact photo for ${id} to Supabase Storage. Size: ${result.buffer.length}, Type: ${result.contentType}`);
        await supabase.storage
          .from('property-files')
          .upload(filePath, result.buffer, {
            contentType: result.contentType,
            upsert: true
          });
          
        console.log(`[Photo] Successfully cached contact photo for ${id} to Supabase Storage`);
      } catch (uploadError) {
        console.warn('[Photo] Failed to upload contact photo to Supabase:', uploadError);
      }
    }

    res.setHeader('Content-Type', result.contentType);
    // Allow caching of successful images
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
    return res.status(200).send(result.buffer);
  } catch (error) {
    console.error('Contact photo fetch error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ message });
  }
}
