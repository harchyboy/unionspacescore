
// import fetch from 'node-fetch'; // Native fetch in Node 18+

const linkedinUrl = 'https://www.linkedin.com/in/abishek-santosh-kumar-0979731b6/';

async function testDirectFetch() {
  try {
    const response = await fetch(linkedinUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    console.log(`Response status: ${response.status}`);
    const text = await response.text();
    
    // Look for og:image
    const ogImageMatch = text.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch) {
        console.log('Found og:image:', ogImageMatch[1]);
    } else {
        console.log('No og:image found');
    }

    // Look for other image indicators
    if (text.includes('authwall')) {
        console.log('Hit Authwall');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testDirectFetch();
