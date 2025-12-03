import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createContact, listContacts } from './_lib/zoho';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const page = parseNumber(req.query.page, 1);
      const pageSize = parseNumber(req.query.pageSize, 200);
      const { items, info } = await listContacts(page, pageSize);

      return res.status(200).json({
        items,
        page,
        pageSize,
        total: info.count ?? items.length,
        moreRecords: info.more_records ?? false,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      const { firstName, lastName, email, phone, company, type, role } = body ?? {};

      if (!lastName || !email) {
        return res.status(400).json({
          message: 'lastName and email are required',
        });
      }

      const contact = await createContact({
        firstName,
        lastName,
        email,
        phone,
        company,
        type,
        role,
      });

      return res.status(201).json(contact);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Contacts API error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(500).json({ message });
  }
}

