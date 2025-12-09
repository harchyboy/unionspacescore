import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.js';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'professional-network-data.p.rapidapi.com';

interface LinkedInPerson {
  linkedin_url?: string;
  profile_url?: string;
  url?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  location?: string;
  public_identifier?: string;
}

interface LinkedInSearchResult {
  data?: LinkedInPerson[];
  results?: LinkedInPerson[];
  items?: LinkedInPerson[];
  success?: boolean;
  message?: string;
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

  // Use the search-people endpoint from Professional Network Data API
  const url = `https://${RAPIDAPI_HOST}/search-people?keywords=${encodeURIComponent(keywords)}&start=0`;

  console.log('Searching LinkedIn with URL:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('LinkedIn API error response:', text);
    throw new Error(`LinkedIn API error: ${response.status} - ${text}`);
  }

  const responseData = await response.json() as LinkedInSearchResult;
  
  console.log('LinkedIn search results:', JSON.stringify(responseData, null, 2));
  
  // Handle different response formats
  const items = responseData.data || responseData.results || responseData.items || [];
  
  if (items.length === 0) {
    console.log('No results found');
    return null;
  }

  // Try to find exact name match
  const exactMatch = items.find(item => {
    const itemFirstName = (item.first_name || item.full_name?.split(' ')[0] || '').toLowerCase();
    const itemLastName = (item.last_name || item.full_name?.split(' ').slice(1).join(' ') || '').toLowerCase();
    return itemFirstName === firstName.toLowerCase() && 
           itemLastName === lastName.toLowerCase();
  });

  if (exactMatch) {
    const linkedinUrl = exactMatch.linkedin_url || exactMatch.profile_url || exactMatch.url || 
      (exactMatch.public_identifier ? `https://www.linkedin.com/in/${exactMatch.public_identifier}` : null);
    if (linkedinUrl) {
      console.log('Found exact match:', linkedinUrl);
      return linkedinUrl;
    }
  }

  // Return first result if no exact match
  const firstResult = items[0];
  const linkedinUrl = firstResult.linkedin_url || firstResult.profile_url || firstResult.url ||
    (firstResult.public_identifier ? `https://www.linkedin.com/in/${firstResult.public_identifier}` : null);
  
  if (linkedinUrl) {
    console.log('Using first result:', linkedinUrl);
    return linkedinUrl;
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

