import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from './lib/supabase.js';
import { zohoRequest } from './lib/zoho.js';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = typeof req.query.id === 'string' ? req.query.id : undefined;
  const { linkedinUrl } = req.body as { linkedinUrl?: string };

  if (!id) {
    return res.status(400).json({ error: 'Contact ID required' });
  }

  if (!linkedinUrl) {
    return res.status(400).json({ error: 'LinkedIn URL required' });
  }

  // Validate URL
  if (!linkedinUrl.includes('linkedin.com/in/')) {
    return res.status(400).json({ error: 'Invalid LinkedIn profile URL' });
  }

  try {
    const supabase = getSupabase();
    let zohoId = id;
    
    // Check if ID is a UUID (Supabase ID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    // Update in Supabase
    if (supabase) {
      const updateData = {
        linkedin_url: linkedinUrl,
        enrichment_status: 'enriched',
        enriched_at: new Date().toISOString(),
      };

      let query = supabase.from('contacts').update(updateData);

      if (isUuid) {
        query = query.eq('id', id);
        // If it's a UUID, we need to fetch the Zoho ID for the CRM update
        const { data: contact } = await supabase
          .from('contacts')
          .select('zoho_id')
          .eq('id', id)
          .single();
          
        if (contact?.zoho_id) {
          zohoId = contact.zoho_id;
        } else {
          // If no zoho_id found, we can't update Zoho, but we continue
          console.log(`No Zoho ID found for contact ${id}, skipping Zoho update`);
          zohoId = undefined; 
        }
      } else {
        // If it's not a UUID, assume it's a Zoho ID
        query = query.eq('zoho_id', id);
      }

      const { error: dbError } = await query;

      if (dbError) {
        console.error('Supabase update error:', dbError);
        // We don't throw here to attempt Zoho update if possible, or return partial success?
        // But if DB update fails, we probably should report it.
      }
    }

    // Also update in Zoho CRM (if we have a valid Zoho ID)
    if (zohoId) {
      try {
        await zohoRequest(
          `/crm/v2/Contacts/${zohoId}`,
          'PUT',
          {
            data: [{
              id: zohoId,
              LinkedIn_URL: linkedinUrl,
            }]
          }
        );
        console.log(`Updated LinkedIn URL in Zoho CRM for contact ${zohoId}`);
      } catch (zohoError) {
        // Zoho update is nice-to-have, don't fail if it doesn't work
        console.log('Could not update Zoho CRM (field may not exist):', zohoError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'LinkedIn URL saved',
      linkedinUrl
    });

  } catch (error) {
    console.error('Error saving LinkedIn URL:', error);
    return res.status(500).json({
      error: 'Failed to save LinkedIn URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

