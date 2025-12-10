
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { zohoRequest } from './lib/zoho.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    const url = id ? `/crm/v2/Contacts/${id}` : '/crm/v2/Contacts?per_page=1';
    
    const response = await zohoRequest<{ data: any[] }>(url);
    
    if (response.data && response.data.length > 0) {
      const contact = response.data[0];
      const keys = Object.keys(contact).sort();
      const potentialMatches = keys.filter(key => 
        key.toLowerCase().includes('link') || 
        key.toLowerCase().includes('url') || 
        key.toLowerCase().includes('social') ||
        key.toLowerCase().includes('web')
      ).map(key => ({ key, value: contact[key] }));

      return res.status(200).json({
        message: 'Zoho Contact Fields Inspection',
        potentialMatches,
        allKeys: keys,
        // contact // Uncomment to see full contact data if needed (be careful with PII)
      });
    }
    
    return res.status(404).json({ error: 'No contact found' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

