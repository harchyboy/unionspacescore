import { getContactFromZoho } from '../src/api/contacts'; // We might need to adjust this import path depending on where api/contacts.ts is relative to api/linkedin-approve.ts. 
// Actually api/linkedin-approve.ts is in api/, and api/contacts.ts is in src/api/contacts.ts? No, api/contacts.ts is likely the Vercel function.
// Let's check the file structure again.
// api/contacts.ts exists.
// src/api/contacts.ts exists (frontend client).
// I should import from './contacts' if it exports getContactFromZoho.
// checking api/contacts.ts content from previous read...
// Yes, api/contacts.ts exports getContactFromZoho.

import { getContactFromZoho } from './contacts.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
// ...
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
    if (!supabase) {
      return res.status(500).json({
        error: 'Database not configured',
        message: 'Supabase client not available'
      });
    }

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

    const { error: dbError, data: updatedData } = await query;

    if (dbError) {
      console.error('Supabase update error:', dbError);
      return res.status(500).json({
        error: 'Failed to save LinkedIn URL',
        message: dbError.message || 'Database update failed'
      });
    }

    // Check if any rows were updated
    if (!updatedData || updatedData.length === 0) {
      // Contact not found in DB. If we have a Zoho ID, try to fetch from Zoho and insert into DB.
      if (zohoId) {
        console.log(`Contact ${zohoId} not found in DB, fetching from Zoho to sync...`);
        try {
          // Dynamic import to avoid circular dependencies if any, or just use the imported function
          const zohoContact = await getContactFromZoho(zohoId);
          
          if (zohoContact) {
            // Insert into Supabase
            const { error: insertError } = await supabase.from('contacts').insert({
              zoho_id: zohoContact.id,
              first_name: zohoContact.firstName,
              last_name: zohoContact.lastName,
              full_name: zohoContact.name,
              email: zohoContact.email,
              phone: zohoContact.phone,
              mobile: zohoContact.mobile,
              role: zohoContact.role,
              company_name: zohoContact.company,
              account_id: zohoContact.accountId,
              contact_type: zohoContact.type,
              territory: zohoContact.territory,
              relationship_health: zohoContact.health,
              linkedin_url: linkedinUrl, // The new URL
              enrichment_status: 'enriched',
              enriched_at: new Date().toISOString(),
              zoho_modified_at: zohoContact.updatedAt,
              zoho_created_at: zohoContact.createdAt
            });

            if (insertError) {
              console.error('Supabase insert error:', insertError);
              return res.status(500).json({
                error: 'Failed to sync contact',
                message: insertError.message
              });
            }
            
            console.log(`Synced contact ${zohoId} from Zoho to DB with LinkedIn URL`);
          } else {
            return res.status(404).json({
              error: 'Contact not found',
              message: 'Contact not found in Zoho CRM either.'
            });
          }
        } catch (err) {
           console.error('Error syncing from Zoho:', err);
           return res.status(500).json({
             error: 'Failed to sync contact',
             message: err instanceof Error ? err.message : 'Unknown error'
           });
        }
      } else {
        return res.status(404).json({
          error: 'Contact not found',
          message: 'No contact was updated. The contact may not exist.'
        });
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

