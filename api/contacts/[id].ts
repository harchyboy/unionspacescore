import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { updateContact, deleteContactById, getContactFromDb, getContactFromZoho } from '../contacts';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function getContact(id: string) {
  // Try database first if configured
  if (isSupabaseConfigured()) {
    const dbContact = await getContactFromDb(id);
    if (dbContact) return dbContact;
  }
  
  // Fallback to Zoho
  return getContactFromZoho(id);
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
      const contact = await getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      return res.status(200).json(contact);
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      
      const contact = await updateContact(id, {
        firstName: body?.firstName?.toString().trim(),
        lastName: body?.lastName?.toString().trim(),
        email: body?.email?.toString().trim(),
        phone: body?.phone?.toString().trim(),
        mobile: body?.mobile?.toString().trim(),
        accountId: body?.accountId?.toString().trim(),
        type: body?.type?.toString().trim(),
        role: body?.role?.toString().trim(),
        territory: body?.territory?.toString().trim(),
        notes: body?.notes?.toString().trim(),
        health: body?.health?.toString().trim(),
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
    return res.status(500).json({ message });
  }
}
