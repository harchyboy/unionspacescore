import type { VercelRequest, VercelResponse } from '@vercel/node';
import { zohoFetchRaw } from '../lib/zoho.js';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const moduleApiName = String(req.query.module || '');
  const recordId = String(req.query.recordId || '');
  const attachmentId = String(req.query.attachmentId || '');

  if (!moduleApiName || !recordId || !attachmentId) {
    return res.status(400).json({
      error: 'Missing required query params',
      required: ['module', 'recordId', 'attachmentId'],
    });
  }

  // Zoho endpoint to download attachment binary
  const path = `/crm/v2/${encodeURIComponent(moduleApiName)}/${encodeURIComponent(recordId)}/Attachments/${encodeURIComponent(attachmentId)}`;

  const zohoRes = await zohoFetchRaw(path, { method: 'GET' });
  if (!zohoRes.ok) {
    const text = await zohoRes.text().catch(() => '');
    return res.status(zohoRes.status).json({
      error: 'Failed to fetch attachment from Zoho',
      status: zohoRes.status,
      details: text?.slice(0, 500),
    });
  }

  // Forward content-type if present; default to octet-stream
  const contentType = zohoRes.headers.get('content-type') || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  const contentLength = zohoRes.headers.get('content-length');
  if (contentLength) res.setHeader('Content-Length', contentLength);

  // Cache lightly at the edge; attachments don't change often
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

  const ab = await zohoRes.arrayBuffer();
  return res.status(200).send(Buffer.from(ab));
}


