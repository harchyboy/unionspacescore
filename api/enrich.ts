import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from './lib/supabase.js';
import { zohoRequest, ZohoContactRecord } from './lib/zoho.js';

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

interface SearchResult {
  linkedinUrl: string | null;
  rawResponse?: unknown;
}

async function searchLinkedInQuery(keywords: string): Promise<LinkedInSearchResult> {
  const url = `https://${RAPIDAPI_HOST}/search-people?keywords=${encodeURIComponent(keywords)}&start=0`;
  console.log('Searching LinkedIn with URL:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('LinkedIn API error response:', text);
    throw new Error(`LinkedIn API error: ${response.status} - ${text}`);
  }

  const responseText = await response.text();
  console.log('LinkedIn RAW response:', responseText);
  
  try {
    return JSON.parse(responseText) as LinkedInSearchResult;
  } catch (e) {
    console.error('Failed to parse RapidAPI response:', responseText);
    throw new Error(`Invalid RapidAPI response: ${responseText.substring(0, 200)}`);
  }
}

function extractItems(responseData: LinkedInSearchResult): LinkedInPerson[] {
  // Handle nested structure: { data: { items: [...] } }
  const nestedData = responseData.data as { items?: LinkedInPerson[] } | LinkedInPerson[] | undefined;
  if (nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData) && Array.isArray(nestedData.items)) {
    return nestedData.items;
  } else if (Array.isArray(responseData.data)) {
    return responseData.data;
  } else if (Array.isArray(responseData.results)) {
    return responseData.results;
  } else if (Array.isArray(responseData.items)) {
    return responseData.items;
  }
  return [];
}

async function searchLinkedIn(firstName: string, lastName: string, company?: string, debug = false): Promise<SearchResult> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  // Strategy: Try name + company first, then just name if no results
  const searchQueries = company 
    ? [`${firstName} ${lastName} ${company}`, `${firstName} ${lastName}`]
    : [`${firstName} ${lastName}`];
  
  let lastResponse: LinkedInSearchResult | null = null;
  
  for (const keywords of searchQueries) {
    console.log(`Trying search: "${keywords}"`);
    const responseData = await searchLinkedInQuery(keywords);
    lastResponse = responseData;
    
    const items = extractItems(responseData);
    if (items.length > 0) {
      console.log(`Found ${items.length} results for "${keywords}"`);
      return findBestMatch(items, firstName, lastName, debug ? responseData : undefined);
    }
  }
  
  console.log('No results found after trying all search queries');
  return { linkedinUrl: null, rawResponse: debug ? lastResponse : undefined };

}

function findBestMatch(items: LinkedInPerson[], firstName: string, lastName: string, rawResponse?: LinkedInSearchResult): SearchResult {
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
      return { linkedinUrl, rawResponse };
    }
  }

  const firstResult = items[0];
  const linkedinUrl = firstResult.linkedin_url || firstResult.profile_url || firstResult.url ||
    (firstResult.public_identifier ? `https://www.linkedin.com/in/${firstResult.public_identifier}` : null);

  if (linkedinUrl) {
    console.log('Using first result:', linkedinUrl);
    return { linkedinUrl, rawResponse };
  }

  return { linkedinUrl: null, rawResponse };
}

async function updateContactLinkedIn(
  zohoId: string,
  linkedinUrl: string | null,
  status: 'enriched' | 'not_found' | 'error'
) {
  const supabase = getSupabase();

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

// Fallback: fetch contact directly from Zoho CRM
async function getContactFromZoho(zohoId: string) {
  try {
    const response = await zohoRequest<{ data?: ZohoContactRecord[] }>(
      `/crm/v2/Contacts/${zohoId}`
    );
    const record = response.data?.[0];
    if (!record) return null;
    
    return {
      zoho_id: record.id,
      first_name: record.First_Name || '',
      last_name: record.Last_Name || '',
      company_name: record.Account_Name?.name || null,
      linkedin_url: null,
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

  if (!id) {
    return res.status(400).json({ error: 'Contact ID required' });
  }

  if (!RAPIDAPI_KEY) {
    return res.status(503).json({
      error: 'LinkedIn enrichment not configured',
      message: 'Set RAPIDAPI_KEY environment variable'
    });
  }

  try {
    // Try database first, then fall back to Zoho CRM
    let contact = await getContactFromDb(id);
    
    if (!contact) {
      console.log(`Contact ${id} not in database, fetching from Zoho CRM...`);
      contact = await getContactFromZoho(id);
    }

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found in database or Zoho CRM' });
    }

    if (contact.linkedin_url) {
      return res.status(200).json({
        success: true,
        linkedinUrl: contact.linkedin_url,
        status: 'already_enriched',
        message: 'Contact already has LinkedIn URL',
      });
    }

    console.log(`Searching LinkedIn for: ${contact.first_name} ${contact.last_name}, ${contact.company_name}`);

    // Check if debug mode requested
    const debugMode = req.query.debug === 'true';

    const result = await searchLinkedIn(
      contact.first_name,
      contact.last_name,
      contact.company_name || undefined,
      debugMode
    );

    if (result.linkedinUrl) {
      await updateContactLinkedIn(id, result.linkedinUrl, 'enriched');

      return res.status(200).json({
        success: true,
        linkedinUrl: result.linkedinUrl,
        status: 'enriched',
        message: 'LinkedIn profile found',
        ...(debugMode && result.rawResponse ? { rawApiResponse: result.rawResponse } : {})
      });
    } else {
      await updateContactLinkedIn(id, null, 'not_found');

      return res.status(200).json({
        success: false,
        linkedinUrl: null,
        status: 'not_found',
        message: 'No LinkedIn profile found',
        debug: {
          searchedFor: `${contact.first_name} ${contact.last_name} ${contact.company_name || ''}`.trim(),
        },
        ...(debugMode && result.rawResponse ? { rawApiResponse: result.rawResponse } : {})
      });
    }
  } catch (error) {
    console.error('Enrichment error:', error);

    await updateContactLinkedIn(id, null, 'error').catch(() => {});

    return res.status(500).json({
      error: 'Enrichment failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}


