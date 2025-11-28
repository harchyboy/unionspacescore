import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  avatar?: string;
  status?: 'Active' | 'Inactive' | 'Lead';
  lastContacted?: string;
  notes?: string;
  [key: string]: unknown;
}

// Helper to map Zoho response to Contact interface
function mapZohoContact(zohoContact: Record<string, unknown>): Contact {
  return {
    id: (zohoContact.id as string) || (zohoContact.ID as string) || `zoho-${Math.random()}`,
    name: (zohoContact.name as string) || (zohoContact.Name as string) || 'Unknown Name',
    email: (zohoContact.email as string) || (zohoContact.Email as string) || '',
    phone: (zohoContact.phone as string) || (zohoContact.Phone as string) || '',
    role: (zohoContact.role as string) || (zohoContact.Job_Title as string) || '',
    company: (zohoContact.company as string) || (zohoContact.Company as string) || '',
    status: (zohoContact.status as 'Active' | 'Inactive' | 'Lead') || 'Active',
    lastContacted: (zohoContact.lastContacted as string) || new Date().toISOString(),
    _zohoRaw: zohoContact
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { id } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ZOHO_PUBLIC_KEY = process.env.ZOHO_PUBLIC_KEY;

  // GET /api/contacts - List contacts
  if (method === 'GET' && !id) {
    let contacts: Contact[] = [];
    let zohoError = null;

    try {
      const ZOHO_GET_CONTACTS_URL = process.env.ZOHO_GET_CONTACTS_URL;

      if (ZOHO_PUBLIC_KEY && ZOHO_GET_CONTACTS_URL) {
        const url = `${ZOHO_GET_CONTACTS_URL}?publickey=${ZOHO_PUBLIC_KEY}`;
        const response = await axios.post(url, {}); 
        
        if (response.data && (response.data.code === 3000 || response.data.result)) {
          const rawData = response.data.result || response.data;
          
          if (Array.isArray(rawData)) {
            contacts = rawData.map(mapZohoContact);
          } else if (typeof rawData === 'object') {
             contacts = Object.values(rawData).map(mapZohoContact);
          }
        }
      }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching contacts from Zoho:', errorMessage);
    zohoError = errorMessage;
  }

    const search = (req.query.search as string)?.toLowerCase() || '';
    const company = (req.query.company as string) || '';
    
    const filtered = contacts.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search) && !c.email.toLowerCase().includes(search)) {
        return false;
      }
      if (company && c.company !== company) {
        return false;
      }
      return true;
    });

    return res.status(200).json({
      contacts: filtered,
      total: filtered.length,
      source: zohoError ? 'zoho_failed' : 'zoho_live'
    });
  }

  // GET /api/contacts/:id - Get contact by ID
  if (method === 'GET' && id) {
    // Logic to get single contact would go here
    return res.status(404).json({ error: 'Single contact fetch not implemented yet' });
  }

  // POST /api/contacts - Create contact
  if (method === 'POST') {
    const payload = req.body as Partial<Contact>;
    const ZOHO_CREATE_CONTACT_URL = process.env.ZOHO_CREATE_CONTACT_URL;

    if (!ZOHO_PUBLIC_KEY || !ZOHO_CREATE_CONTACT_URL) {
        return res.status(500).json({ error: 'Zoho configuration missing' });
    }

    try {
        const url = `${ZOHO_CREATE_CONTACT_URL}?publickey=${ZOHO_PUBLIC_KEY}`;
        
        // Map frontend payload to what your Zoho function expects
        // Zoho Function: create_crm_contact(name, email, phone, company, type, territory, ...)
        // NOTE: You must update your Zoho Creator function to accept this JSON map argument 'data'
        // OR update the function signature to accept all these individual arguments.
        // Sending as a single 'data' JSON string is often easier.
        
        const zohoPayload = {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            company: payload.company,
            
            // Pass all other fields as a map or individual fields depending on your Zoho setup
            // Here we pass a 'details' map for flexibility if the Zoho function supports it
            details: {
                role: payload.role,
                cityRegion: payload.cityRegion,
                contactType: payload.contactType,
                brokerageTerritory: payload.brokerageTerritory,
                specialisms: payload.specialisms,
                preferredSubmarkets: payload.preferredSubmarkets,
                referralSource: payload.referralSource,
                commissionStructure: payload.commissionStructure,
                landlordRoster: payload.landlordRoster,
                instructionTypes: payload.instructionTypes,
                serviceCategory: payload.serviceCategory,
                coverageAreas: payload.coverageAreas,
                rateCard: payload.rateCard,
                leadTime: payload.leadTime,
                portfolioSize: payload.portfolioSize,
                assetClasses: payload.assetClasses,
                geographicFocus: payload.geographicFocus,
                propertyCount: payload.propertyCount,
                companySize: payload.companySize,
                industrySector: payload.industrySector,
                minSize: payload.minSize,
                maxSize: payload.maxSize,
                budgetMin: payload.budgetMin,
                budgetMax: payload.budgetMax,
                relationshipNotes: payload.relationshipNotes,
                emailLoggingConsent: payload.emailLoggingConsent,
                confidentialRequirement: payload.confidentialRequirement,
                communicationCadence: payload.communicationCadence,
                contactStatus: payload.contactStatus
            }
        };

        const response = await axios.post(url, zohoPayload);

        if (response.data && (response.data.code === 3000 || response.data.result)) {
             return res.status(201).json({ 
                 message: 'Contact created', 
                 zohoResponse: response.data 
             });
        } else {
            throw new Error(JSON.stringify(response.data));
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error creating contact in Zoho:', errorMessage);
        return res.status(500).json({ 
            error: 'Failed to create contact in Zoho', 
            details: errorMessage 
        });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
