
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

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'professional-network-data.p.rapidapi.com';

const linkedinUrl = 'https://www.linkedin.com/in/abishek-santosh-kumar-0979731b6/';

async function testRapidApi() {
  if (!RAPIDAPI_KEY) {
    console.error('RAPIDAPI_KEY is not set in .env or .env.local');
    return;
  }

  const match = linkedinUrl.match(/linkedin\.com\/in\/([^/?]+)/);
  const publicId = match ? match[1] : null;
  
  if (!publicId) {
    console.error('Could not extract public ID from URL');
    return;
  }

  console.log(`Searching for public ID: ${publicId}`);
  
  const url = `https://${RAPIDAPI_HOST}/search-people?keywords=${encodeURIComponent(publicId)}&start=0`;
  
  try {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST,
        },
    });

    if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(text);
        return;
    }

    const data = await response.json();
    console.log('Search API Response:', JSON.stringify(data, null, 2));

    const items = data.data?.items || data.items || [];
    if (items.length > 0) {
        // Find the item
        const person = items.find(p => 
            (p.public_identifier === publicId) || 
            (p.url && p.url.includes(publicId)) ||
            (p.profile_url && p.profile_url.includes(publicId))
        ) || items[0];

        const imageUrl = person.profile_pic_url || person.profile_image_url || person.image_url || person.img_url;
        console.log('Found Image URL:', imageUrl);

        if (imageUrl) {
            // Try fetching the image
            const imgRes = await fetch(imageUrl);
            if (imgRes.ok) {
                console.log('Image fetch successful:', imgRes.status);
                const buffer = await imgRes.buffer();
                console.log(`Image size: ${buffer.length} bytes`);
            } else {
                console.error('Image fetch failed:', imgRes.status);
            }
        }
    } else {
        console.log('No items found in search result.');
    }

  } catch (error) {
    console.error('Execution error:', error);
  }
}

testRapidApi();
