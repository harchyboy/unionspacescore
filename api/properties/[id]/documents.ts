import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST /api/properties/:id/documents - Upload document (mock)
  if (req.method === 'POST') {
    // Mock response - in a real app, you'd handle file upload here
    return res.status(200).json({
      id: `doc-${Date.now()}`,
      url: `/documents/${req.query.id}/sample.pdf`,
      name: 'sample.pdf',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

