import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from './lib/supabase.js';
import { zohoRequest } from './lib/zoho.js';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Minimal Zoho fetch to avoid cross-file imports in serverless runtime
async function fetchZohoContact(zohoId: string) {
  try {
    const response = await zohoRequest<{
      data?: Array<{
        id: string;
        First_Name?: string;
        Last_Name?: string;
        Full_Name?: string;
        Email?: string;
        Phone?: string | null;
        Mobile?: string | null;
        Title?: string | null;
        Account_Name?: { id: string; name: string } | null;
        Contact_Type?: string | null;
        Territory?: string | null;
        Relationship_Health?: string | null;
        Relationship_Health_Score?: number | null;
        Modified_Time?: string | null;
        Created_Time?: string | null;
      }>;
    }>(`/crm/v2/Contacts/${zohoId}`);

    const record = response.data?.[0];
    if (!record) return null;

    const firstName = record.First_Name || '';
    const lastName = record.Last_Name || '';
    const fullName = record.Full_Name || `${firstName} ${lastName}`.trim() || 'Unnamed Contact';

    return {
      id: record.id,
      firstName,
      lastName,
      name: fullName,
      email: record.Email || '',
      phone: record.Phone ?? null,
      mobile: record.Mobile ?? null,
      role: record.Title ?? null,
      company: record.Account_Name?.name ?? null,
      accountId: record.Account_Name?.id ?? null,
      type: record.Contact_Type ?? 'Broker',
      territory: record.Territory ?? null,
      health: record.Relationship_Health ?? 'good',
      relationshipHealthScore: record.Relationship_Health_Score ?? null,
      updatedAt: record.Modified_Time ?? null,
      createdAt: record.Created_Time ?? null,
    };
  } catch (error) {
    console.error('Error fetching contact from Zoho:', error);
    return null;
  }
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
    let zohoId: string | undefined = id;

    // Check if ID is a UUID (Supabase ID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
      // If it's a UUID, fetch zoho_id for CRM update
      const { data: contact } = await supabase
        .from('contacts')
        .select('zoho_id')
        .eq('id', id)
        .single();

      if (contact?.zoho_id) {
        zohoId = contact.zoho_id;
      } else {
        console.log(`No Zoho ID found for contact ${id}, skipping Zoho update`);
        zohoId = undefined;
      }
    } else {
      // Non-UUID: treat as Zoho ID
      query = query.eq('zoho_id', id);
      zohoId = id;
    }

    // Request updated rows so we know if the update affected anything
    const { error: dbError, data: updatedData } = await query.select();

    if (dbError) {
      console.error('Supabase update error:', dbError);
      return res.status(500).json({
        error: 'Failed to save LinkedIn URL',
        message: dbError.message || 'Database update failed'
      });
    }

    // If no rows were updated, try to fetch from Zoho and insert
    if (!updatedData || updatedData.length === 0) {
      if (zohoId) {
        console.log(`Contact ${zohoId} not found in DB, fetching from Zoho to sync...`);
        const zohoContact = await fetchZohoContact(zohoId);

        if (zohoContact) {
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
            linkedin_url: linkedinUrl,
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
            message: 'Contact not found in Zoho CRM.'
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
          {
            method: 'PUT',
            body: JSON.stringify({
              data: [{
                id: zohoId,
                LinkedIn_URL: linkedinUrl,
              }]
            })
          }
        );
        console.log(`Updated LinkedIn URL in Zoho CRM for contact ${zohoId}`);
      } catch (zohoError) {
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