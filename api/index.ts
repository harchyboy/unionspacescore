import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only handle GET requests to root
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    // In Vercel, the public folder is copied to dist during build
    // Try multiple possible paths
    const possiblePaths = [
      join(process.cwd(), 'dist', 'Property List Dashboard.html'),
      join(process.cwd(), 'public', 'Property List Dashboard.html'),
      join(__dirname, '..', 'public', 'Property List Dashboard.html'),
      join(__dirname, '..', 'dist', 'Property List Dashboard.html'),
    ];

    let html: string | null = null;
    for (const path of possiblePaths) {
      try {
        html = readFileSync(path, 'utf-8');
        break;
      } catch {
        // Try next path
      }
    }

    if (!html) {
      return res.status(500).send('Dashboard file not found');
    }
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error serving dashboard:', error);
    return res.status(500).send('Error loading dashboard');
  }
}

