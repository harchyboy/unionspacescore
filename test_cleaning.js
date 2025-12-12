
function cleanSubmarket(raw) {
    let values = [];
    const trimmed = raw.trim();
    
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                values = parsed.map(v => String(v).trim());
            } else {
                values = [trimmed];
            }
        } catch (e) {
            values = [trimmed];
        }
    } else {
        values = [trimmed];
    }

    const results = [];
    values.forEach(v => {
        let clean = v.replace(/^"|"$/g, '').trim();
        if (clean.startsWith('["') && clean.endsWith('"]')) {
            clean = clean.slice(2, -2).trim();
        } else if (clean.startsWith('[') && clean.endsWith(']')) {
            clean = clean.slice(1, -1).trim();
        }
        
        // Extra cleaning for escaped quotes
        clean = clean.replace(/\\"/g, '"');
        
        // Remove surrounding quotes again just in case
        clean = clean.replace(/^"|"$/g, '').trim();

        if (clean) {
            results.push(clean);
        }
    });
    
    return results;
}

const testCases = [
    '["City"]',
    '["Old Street & Shoreditch"]',
    '["Fitzrovia & Marylebone", "Soho & Covent Garden"]',
    '"Midtown"',
    'City',
    '["\\"City\\""]', // Escaped quotes
    "['City']" // Single quotes
];

testCases.forEach(t => {
    console.log(`Input: ${t}`);
    console.log(`Output:`, cleanSubmarket(t));
    console.log('---');
});
