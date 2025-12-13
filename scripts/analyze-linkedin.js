
// import fetch from 'node-fetch';

const url = 'https://www.linkedin.com/in/abishek-santosh-kumar-0979731b6/';

async function analyzeProfile() {
  try {
    console.log(`Fetching ${url}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    console.log(`Status: ${response.status}`);
    const html = await response.text();
    
    // Check for og:image
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
    console.log('og:image:', ogImage ? ogImage[1] : 'Not found');

    // Check for schema.org data
    const schema = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (schema) {
        console.log('Found LD+JSON Schema');
        try {
            const json = JSON.parse(schema[1]);
            console.log('Schema Image:', json.image);
        } catch (e) {
            console.log('Error parsing schema JSON');
        }
    } else {
        console.log('No LD+JSON Schema found');
    }

    // Check for other image tags
    const profileImg = html.match(/"contentUrl":"([^"]+)"/);
    if (profileImg) {
        console.log('Found contentUrl (possible image):', profileImg[1]);
    }

    if (html.includes('authwall')) {
        console.log('Detected Authwall');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeProfile();
