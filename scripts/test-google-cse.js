
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env loader
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Loading env from ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // remove quotes
        process.env[key] = value;
      }
    });
  }
}

loadEnv(envPath);
loadEnv(envLocalPath);

const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

const linkedinUrl = 'https://www.linkedin.com/in/abishek-santosh-kumar-0979731b6/';

async function testGoogleCSE() {
  if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
    console.error('GOOGLE_CSE keys are not set in .env');
    return;
  }

  // Query similar to what we use: site:linkedin.com/in/...
  const query = `site:${linkedinUrl}`;
  console.log(`Searching Google CSE for: ${query}`);

  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CSE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        console.error('Google CSE Error:', data.error.message);
        return;
    }

    console.log(`Found ${data.items?.length || 0} items`);

    if (data.items && data.items.length > 0) {
        const item = data.items[0];
        console.log('First Item Title:', item.title);
        console.log('First Item Link:', item.link);
        console.log('Pagemap:', JSON.stringify(item.pagemap, null, 2));

        // Test our extraction logic
        let imageUrl = item.pagemap?.metatags?.[0]?.['og:image'];
  
        if (!imageUrl && item.pagemap?.cse_image && item.pagemap.cse_image.length > 0) {
            console.log('Found cse_image');
            imageUrl = item.pagemap.cse_image[0].src;
        }
        
        if (!imageUrl && item.pagemap?.cse_thumbnail && item.pagemap.cse_thumbnail.length > 0) {
            console.log('Found cse_thumbnail');
            imageUrl = item.pagemap.cse_thumbnail[0].src;
        }

        console.log('Extracted Image URL:', imageUrl);
    }

  } catch (error) {
    console.error('Execution error:', error);
  }
}

testGoogleCSE();
