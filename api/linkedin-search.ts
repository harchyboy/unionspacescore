import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from './lib/supabase.js';
import { zohoRequest, ZohoContactRecord } from './lib/zoho.js';

const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  pagemap?: {
    metatags?: Array<{
      'og:title'?: string;
      'og:description'?: string;
      'og:image'?: string;
    }>;
    person?: Array<{
      name?: string;
      jobtitle?: string;
    }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  error?: {
    code: number;
    message: string;
  };
}

interface LinkedInCandidate {
  name: string;
  headline: string;
  url: string;
  imageUrl?: string;
  matchScore: number;
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function cleanCompanyName(name: string): string {
  let cleaned = name;
  const suffixes = ['inc', 'ltd', 'llc', 'ip', 'plc', 'corp', 'corporation', 'limited', 'company'];
  const regex = new RegExp(`,?\\s*(${suffixes.join('|')})\\.?$`, 'i');
  
  let prev;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(regex, '').trim();
  } while (cleaned !== prev);
  
  return cleaned;
}

async function searchGoogleCSE(query: string): Promise<GoogleSearchResponse> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CSE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}`;
  
  console.log('Google CSE search query:', query);
  
  const response = await fetch(url);
  const data = await response.json() as GoogleSearchResponse;
  
  if (data.error) {
    throw new Error(`Google CSE error: ${data.error.message}`);
  }
  
  return data;
}

function extractLinkedInProfile(item: GoogleSearchItem, targetFirstName: string, targetLastName: string, targetCompany?: string): LinkedInCandidate | null {
  // Only accept linkedin.com/in/ URLs (personal profiles)
  if (!item.link.includes('linkedin.com/in/')) {
    return null;
  }
  
  // Extract name from title (usually "Name - Title | LinkedIn" or "Name | LinkedIn")
  const name = item.title
    .replace(/\s*\|\s*LinkedIn.*$/i, '')
    .replace(/\s*-\s*LinkedIn.*$/i, '')
    .trim();
  
  // Extract headline from snippet or title
  const titleParts = item.title.split(' - ');
  let headline = titleParts.length > 1 ? titleParts.slice(1).join(' - ').replace(/\s*\|.*$/, '').trim() : '';
  
  if (!headline && item.snippet) {
    headline = item.snippet.split('·')[0].trim();
  }
  
  // Try to get image from pagemap
  const imageUrl = item.pagemap?.metatags?.[0]?.['og:image'];
  
  // Calculate match score
  let matchScore = 0;
  const nameLower = name.toLowerCase();
  const targetFullName = `${targetFirstName} ${targetLastName}`.toLowerCase();
  
  // Name match (most important)
  if (nameLower === targetFullName) {
    matchScore += 50;
  } else if (nameLower.includes(targetFirstName.toLowerCase()) && nameLower.includes(targetLastName.toLowerCase())) {
    matchScore += 40;
  } else if (nameLower.includes(targetLastName.toLowerCase())) {
    matchScore += 20;
  }
  
  // Company match
  if (targetCompany) {
    const companyLower = targetCompany.toLowerCase();
    const snippetLower = (item.snippet || '').toLowerCase();
    const headlineLower = headline.toLowerCase();
    
    // Try variations of company name
    const companyVariations = [
      companyLower,
      companyLower.replace(/,?\s*(inc\.?|ltd\.?|llc\.?|ip\.?|plc\.?)$/i, '').trim(),
      companyLower.split(' ')[0], // First word
    ];
    
    for (const variation of companyVariations) {
      if (variation.length > 2 && (snippetLower.includes(variation) || headlineLower.includes(variation))) {
        matchScore += 30;
        break;
      }
    }
  }
  
  // Boost if headline looks professional
  if (headline && (headline.includes('Director') || headline.includes('Manager') || headline.includes('Partner') || headline.includes('Associate'))) {
    matchScore += 5;
  }
  
  return {
    name,
    headline,
    url: item.link,
    imageUrl,
    matchScore
  };
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

  if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
    return res.status(503).json({
      error: 'Google Custom Search not configured',
      message: 'Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID environment variables'
    });
  }

  try {
    // Get contact details
    let contact = await getContactFromDb(id);
    
    if (!contact) {
      console.log(`Contact ${id} not in database, fetching from Zoho CRM...`);
      contact = await getContactFromZoho(id);
    }

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // If already has LinkedIn, return it
    if (contact.linkedin_url) {
      return res.status(200).json({
        success: true,
        alreadyLinked: true,
        linkedinUrl: contact.linkedin_url,
        candidates: []
      });
    }

    const firstName = contact.first_name;
    const lastName = contact.last_name;
    const company = contact.company_name;

    // Build search query
    const searchQuery = company 
      ? `"${firstName} ${lastName}" "${company}" site:linkedin.com/in/`
      : `"${firstName} ${lastName}" site:linkedin.com/in/`;

    console.log(`Searching Google CSE for: ${firstName} ${lastName} at ${company || 'unknown company'}`);

    const searchResults = await searchGoogleCSE(searchQuery);
    const debugQueries: string[] = [searchQuery];
    let debugRawItems: any[] = searchResults.items ? searchResults.items.map(i => ({ title: i.title, link: i.link })) : [];
    
    let candidates: LinkedInCandidate[] = [];
    
    if (searchResults.items && searchResults.items.length > 0) {
      candidates = searchResults.items
        .map(item => extractLinkedInProfile(item, firstName, lastName, company || undefined))
        .filter((c): c is LinkedInCandidate => c !== null);
    }

    if (candidates.length === 0) {
      // Try with cleaned company name if original had suffixes
      if (company) {
        const cleanedCompany = cleanCompanyName(company);
        
        if (cleanedCompany !== company && cleanedCompany.length > 2) {
           console.log(`Retrying with cleaned company name: ${cleanedCompany}`);
           const retryQuery = `"${firstName} ${lastName}" "${cleanedCompany}" site:linkedin.com/in/`;
           debugQueries.push(retryQuery);
           const retryResults = await searchGoogleCSE(retryQuery);
           
           if (retryResults.items) {
             debugRawItems = [...debugRawItems, ...retryResults.items.map(i => ({ title: i.title, link: i.link, query: 'retry_clean_company' }))];
           }
           
           if (retryResults.items && retryResults.items.length > 0) {
             candidates = retryResults.items
              .map(item => extractLinkedInProfile(item, firstName, lastName, cleanedCompany))
              .filter((c): c is LinkedInCandidate => c !== null);
           }
        }
      }

      // If still no candidates, try without company name (fallback)
      if (candidates.length === 0 && company) {
        console.log('Retrying without company name...');
        const fallbackQuery = `"${firstName} ${lastName}" site:linkedin.com/in/`;
        debugQueries.push(fallbackQuery);
        const fallbackResults = await searchGoogleCSE(fallbackQuery);
        
        if (fallbackResults.items) {
             debugRawItems = [...debugRawItems, ...fallbackResults.items.map(i => ({ title: i.title, link: i.link, query: 'fallback_name_only' }))];
        }
        
        if (fallbackResults.items && fallbackResults.items.length > 0) {
          candidates = fallbackResults.items
            .map(item => extractLinkedInProfile(item, firstName, lastName, company)) // Still pass company for scoring
            .filter((c): c is LinkedInCandidate => c !== null);
        }
      }
    }

    // Sort and slice
    candidates.sort((a, b) => b.matchScore - a.matchScore);
    candidates = candidates.slice(0, 5);

    console.log(`Found ${candidates.length} LinkedIn candidates`);

    return res.status(200).json({
      success: true,
      candidates,
      searchedFor: { firstName, lastName, company },
      debug: { queries: debugQueries, rawItems: debugRawItems }
    });

  } catch (error) {
    console.error('LinkedIn search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

