const fs = require('fs');
const http = require('http');
const https = require('https');
const venues = JSON.parse(fs.readFileSync('./sports-venues-data.json', 'utf8'));

// Change this to your live production endpoint (e.g., toriate.com) when deploying to cloud tables
const TARGET_URL = 'http://localhost:5001/api/save-onboarding';

function postData(url, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const bodyStr = JSON.stringify(payload);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
        // If your Express app requires a bearer secret key token check, add it right here:
        // 'Authorization': 'Bearer YOUR_SECRET_JWT_SIGNATURE_STRING'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(bodyStr);
    req.end();
  });
}

async function runSeeder() {
  console.log(`🚀 Commencing safe API onboarding for ${venues.length} venues...`);
  console.log(`🎯 Target URL: ${TARGET_URL}`);
  console.log(`🔍 First venue:`, JSON.stringify(venues[0], null, 2));
  
  for (const venue of venues) {
    try {
      console.log(`\n📡 Sending request for: ${venue.businessName}`);
      const result = await postData(TARGET_URL, venue);
      console.log(`✅ Response:`, JSON.stringify(result, null, 2));
      if (result.success) {
        console.log(`✅ Onboarded Flawlessly: ${venue.businessName} -> Profile ID: ${result.data.id}`);
      }
    } catch (error) {
      console.error(`❌ Refused entry for ${venue.businessName}:`, error.message);
      if (error.stack) console.error(error.stack);
    }
  }
  console.log('🏁 Bulk seed transaction execution finished.');
}

runSeeder();