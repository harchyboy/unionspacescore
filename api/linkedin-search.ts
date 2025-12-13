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
    cse_image?: Array<{ src: string }>;
    cse_thumbnail?: Array<{ src: string }>;
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

function extractLinkedInProfile(
  item: GoogleSearchItem, 
  targetFirstName: string, 
  targetLastName: string, 
  targetCompany?: string,
  context: { city?: string; role?: string } = {}
): LinkedInCandidate | null {
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
  let imageUrl = item.pagemap?.metatags?.[0]?.['og:image'];
  
  if (!imageUrl && item.pagemap?.cse_image && item.pagemap.cse_image.length > 0) {
    imageUrl = item.pagemap.cse_image[0].src;
  }
  
  if (!imageUrl && item.pagemap?.cse_thumbnail && item.pagemap.cse_thumbnail.length > 0) {
    imageUrl = item.pagemap.cse_thumbnail[0].src;
  }
  
  // Calculate match score
  let matchScore = 0;
  const nameLower = name.toLowerCase();
  const targetFullName = `${targetFirstName} ${targetLastName}`.toLowerCase();
  const snippetLower = (item.snippet || '').toLowerCase();
  const headlineLower = headline.toLowerCase();
  
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

  // City match
  if (context.city) {
    const cityLower = context.city.toLowerCase();
    if (snippetLower.includes(cityLower) || headlineLower.includes(cityLower)) {
      matchScore += 15;
    }
  }

  // Role match
  if (context.role) {
    const roleLower = context.role.toLowerCase();
    if (headlineLower.includes(roleLower) || snippetLower.includes(roleLower)) {
      matchScore += 15;
    }
  }
  
  // Boost if headline looks professional
  if (headline && (headline.includes('Director') || headline.includes('Manager') || headline.includes('Partner') || headline.includes('Associate') || headline.includes('MRICS') || headline.includes('Surveyor'))) {
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
    .select('zoho_id, first_name, last_name, company_name, linkedin_url, role, contact_type, account_id')
    .eq('zoho_id', zohoId)
    .single();

  return data;
}

async function getAccountFromDb(accountId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from('accounts')
    .select('city, name')
    .eq('zoho_id', accountId)
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

    if (contact.linkedin_url) {
       // We still return 'alreadyLinked' so the frontend knows, but we populate candidates
       // so the user can re-select/refresh if they want to.
       // Note: Frontend currently checks if (data.alreadyLinked) and shows a toast.
       // We should update frontend to handle this if we want seamless updates.
       // For now, let's keep the backend behaving as "Search" but include the flag.
    }
    const existingLinkedinUrl = contact.linkedin_url;

    const firstName = contact.first_name;
    const lastName = contact.last_name;
    const company = contact.company_name;
    const role = contact.role;
    
    let city: string | undefined = undefined;
    if (contact.account_id) {
       const account = await getAccountFromDb(contact.account_id);
       if (account && account.city) {
         city = account.city;
       }
    }
    
    const context = { city, role };

    // Build search queries strategy
    const queriesToTry: { query: string; type: string }[] = [];

    // 0. If existing URL, search specifically for it to refresh metadata/image
    if (existingLinkedinUrl) {
       console.log(`Contact already has LinkedIn URL: ${existingLinkedinUrl}. Searching for it to update metadata...`);
       queriesToTry.push({
           query: `site:${existingLinkedinUrl}`,
           type: 'existing_url_lookup'
       });
    }

    // 1. Strict company search
    if (company) {
       queriesToTry.push({ 
         query: `"${firstName} ${lastName}" "${company}" site:linkedin.com/in/`,
         type: 'company_strict'
       });
       
       const cleaned = cleanCompanyName(company);
       if (cleaned !== company && cleaned.length > 2) {
         queriesToTry.push({
           query: `"${firstName} ${lastName}" "${cleaned}" site:linkedin.com/in/`,
           type: 'company_cleaned'
         });
       }
    }
    
    // 2. Location search (High confidence if city matches)
    if (city) {
      queriesToTry.push({
        query: `"${firstName} ${lastName}" "${city}" site:linkedin.com/in/`,
        type: 'city_match'
      });
    }
    
    // 3. Role search
    if (role) {
      queriesToTry.push({
        query: `"${firstName} ${lastName}" "${role}" site:linkedin.com/in/`,
        type: 'role_match'
      });
    }

    // 4. Industry search (Contextual)
    queriesToTry.push({
      query: `"${firstName} ${lastName}" "Real Estate" site:linkedin.com/in/`,
      type: 'industry_real_estate'
    });
    
    queriesToTry.push({
      query: `"${firstName} ${lastName}" "Property" site:linkedin.com/in/`,
      type: 'industry_property'
    });
    
    // 5. Fallback (Name only) - Last resort
    queriesToTry.push({
      query: `"${firstName} ${lastName}" site:linkedin.com/in/`,
      type: 'name_only_fallback'
    });

    // 6. Broad fallback
    queriesToTry.push({
      query: `"${firstName} ${lastName}" LinkedIn`,
      type: 'broad_fallback'
    });

    const debugQueries: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debugInfo: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let debugRawItems: any[] = [];
    let candidates: LinkedInCandidate[] = [];
    const seenUrls = new Set<string>();

    console.log(`Starting LinkedIn search for: ${firstName} ${lastName} (Company: ${company}, City: ${city}, Role: ${role})`);

    // Execute searches sequentially until we find good candidates
    for (const { query, type } of queriesToTry) {
      // Don't run too many searches if we already have candidates from better queries
      if (candidates.length >= 3 && type.includes('fallback')) break;
      
      console.log(`Trying search strategy: ${type} - Query: ${query}`);
      debugQueries.push(query);
      
      try {
        const searchResults = await searchGoogleCSE(query);
        debugInfo.push({ query, type, info: searchResults.searchInformation });
        
        if (searchResults.items && searchResults.items.length > 0) {
          debugRawItems = [...debugRawItems, ...searchResults.items.map(i => ({ ...i, queryType: type }))];
          
          const newCandidates = searchResults.items
            .map(item => extractLinkedInProfile(item, firstName, lastName, company || undefined, context))
            .filter((c): c is LinkedInCandidate => c !== null)
            .filter(c => !seenUrls.has(c.url)); // Deduplicate
            
          for (const c of newCandidates) {
            seenUrls.add(c.url);
            candidates.push(c);
          }
          
          // If we found a really good match (high score), we can stop
          // Score > 60 means name match + (company OR city OR role match)
          const hasGoodMatch = newCandidates.some(c => c.matchScore >= 60);
          if (hasGoodMatch) {
            console.log('Found high confidence match, stopping search.');
            break;
          }
        }
      } catch (err) {
        console.error(`Search failed for query: ${query}`, err);
      }
    }

    // Sort and slice
    candidates.sort((a, b) => b.matchScore - a.matchScore);
    candidates = candidates.slice(0, 5);

    console.log(`Found ${candidates.length} LinkedIn candidates`);

    return res.status(200).json({
      success: true,
      candidates,
      searchedFor: { firstName, lastName, company, city, role },
      debug: { queries: debugQueries, rawItems: debugRawItems, info: debugInfo }
    });

  } catch (error) {
    console.error('LinkedIn search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

