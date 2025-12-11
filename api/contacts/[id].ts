import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isSupabaseConfigured } from '../lib/supabase.js';
// Explicit .js extension to avoid ESM directory import issues in Vercel runtime
import {
  updateContact,
  deleteContactById,
  getContactFromDb,
  fetchContactFromZohoAndCache,
} from '../contacts.js';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function getContact(id: string) {
  console.log('[getContact] Fetching contact:', { id, isSupabaseConfigured: isSupabaseConfigured() });
  
  // Try database first if configured
  if (isSupabaseConfigured()) {
    const dbContact = await getContactFromDb(id);
    console.log('[getContact] Database result:', { id, found: !!dbContact, contactType: dbContact?.type });
    if (dbContact) return dbContact;
  }
  
  // Fallback to Zoho
  console.log('[getContact] Falling back to Zoho for:', id);
  const zohoContact = await fetchContactFromZohoAndCache(id);
  console.log('[getContact] Zoho result:', { id, found: !!zohoContact, contactType: zohoContact?.type });
  return zohoContact;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Contact ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const refresh =
        typeof req.query.refresh === 'string' && req.query.refresh.toLowerCase() === 'true';
      const contact = refresh
        ? await fetchContactFromZohoAndCache(id)
        : await getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      return res.status(200).json(contact);
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      
      // Helper function to safely extract and trim string values
      const getStringValue = (value: unknown): string | undefined => {
        if (value === null || value === undefined) return undefined;
        const str = String(value).trim();
        return str === '' ? undefined : str;
      };
      
      const contact = await updateContact(id, {
        firstName: getStringValue(body?.firstName),
        lastName: getStringValue(body?.lastName),
        email: getStringValue(body?.email),
        phone: getStringValue(body?.phone),
        mobile: getStringValue(body?.mobile),
        company: getStringValue(body?.company),
        accountId: getStringValue(body?.accountId),
        type: getStringValue(body?.type),
        role: getStringValue(body?.role),
        territory: getStringValue(body?.territory),
        notes: getStringValue(body?.notes),
        health: getStringValue(body?.health),
        relationshipHealth: getStringValue(body?.relationshipHealth),
        relationshipHealthScore: body?.relationshipHealthScore !== undefined && body?.relationshipHealthScore !== null 
          ? Number(body.relationshipHealthScore) 
          : undefined,
      });
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      return res.status(200).json(contact);
    }

    if (req.method === 'DELETE') {
      await deleteContactById(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Contact API error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const stack = error instanceof Error ? error.stack : undefined;
    return res.status(500).json({ message, stack });
  }
}
