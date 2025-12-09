import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { zohoRequest } from '../../lib/zoho.js';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'linkedin-api8.p.rapidapi.com';

interface LinkedInSearchResult {
  items?: Array<{
    urn?: string;
    username?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    profilePicture?: string;
    url?: string;
    profileURL?: string;
  }>;
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function searchLinkedIn(firstName: string, lastName: string, company?: string): Promise<string | null> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  // Build search query
  const keywords = company 
    ? `${firstName} ${lastName} ${company}`
    : `${firstName} ${lastName}`;

  const url = `https://${RAPIDAPI_HOST}/search-people?keywords=${encodeURIComponent(keywords)}&start=0`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn API error: ${response.status} - ${text}`);
  }

  const data = await response.json() as LinkedInSearchResult;
  
  // Find best match
  const items = data.items || [];
  
  if (items.length === 0) {
    return null;
  }

  // Try to find exact name match
  const exactMatch = items.find(item => {
    const itemFirstName = (item.firstName || '').toLowerCase();
    const itemLastName = (item.lastName || '').toLowerCase();
    return itemFirstName === firstName.toLowerCase() && 
           itemLastName === lastName.toLowerCase();
  });

  if (exactMatch) {
    return exactMatch.profileURL || exactMatch.url || `https://www.linkedin.com/in/${exactMatch.username}`;
  }

  // Return first result if no exact match
  const firstResult = items[0];
  if (firstResult.profileURL || firstResult.url || firstResult.username) {
    return firstResult.profileURL || firstResult.url || `https://www.linkedin.com/in/${firstResult.username}`;
  }

  return null;
}

async function updateContactLinkedIn(
  zohoId: string, 
  linkedinUrl: string | null, 
  status: 'enriched' | 'not_found' | 'error'
) {
  const supabase = getSupabase();
  
  // Update in Supabase
  if (supabase) {
    await supabase
      .from('contacts')
      .update({
        linkedin_url: linkedinUrl,
        enrichment_status: status,
        enriched_at: new Date().toISOString(),
      })
      .eq('zoho_id', zohoId);
  }

  // Update in Zoho CRM (if you have a LinkedIn field there)
  // Uncomment if you've added a LinkedIn_URL field in Zoho CRM:
  /*
  try {
    await zohoRequest(`/crm/v2/Contacts/${zohoId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: [{ LinkedIn_URL: linkedinUrl }],
      }),
    });
  } catch (error) {
    console.error('Failed to update Zoho:', error);
  }
  */
}

async function getContactFromDb(zohoId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from('contacts')
    .select('zoho_id, first_name, last_name, company_name, linkedin_url')
    .eq('zoho_id', zohoId)
    .single();

  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Contact ID required' });
  }

  if (!RAPIDAPI_KEY) {
    return res.status(503).json({ 
      error: 'LinkedIn enrichment not configured',
      message: 'Set RAPIDAPI_KEY environment variable'
    });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ 
      error: 'Database not configured',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
    });
  }

  try {
    // Get contact details
    const contact = await getContactFromDb(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if already enriched
    if (contact.linkedin_url) {
      return res.status(200).json({
        success: true,
        linkedinUrl: contact.linkedin_url,
        status: 'already_enriched',
        message: 'Contact already has LinkedIn URL',
      });
    }

    // Search LinkedIn
    console.log(`Searching LinkedIn for: ${contact.first_name} ${contact.last_name}, ${contact.company_name}`);
    
    const linkedinUrl = await searchLinkedIn(
      contact.first_name,
      contact.last_name,
      contact.company_name || undefined
    );

    if (linkedinUrl) {
      await updateContactLinkedIn(id, linkedinUrl, 'enriched');
      
      return res.status(200).json({
        success: true,
        linkedinUrl,
        status: 'enriched',
        message: 'LinkedIn profile found',
      });
    } else {
      await updateContactLinkedIn(id, null, 'not_found');
      
      return res.status(200).json({
        success: false,
        linkedinUrl: null,
        status: 'not_found',
        message: 'No LinkedIn profile found',
      });
    }
  } catch (error) {
    console.error('Enrichment error:', error);
    
    // Update status to error
    await updateContactLinkedIn(id, null, 'error').catch(() => {});
    
    return res.status(500).json({
      error: 'Enrichment failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

