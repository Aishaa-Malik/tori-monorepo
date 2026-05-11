const fs = require('fs');

const file = '/Users/aisha/tori-monorepo/toriate-monorepo/apps/doubtfearcopy/frontend/src/data/services.ts';
let data = fs.readFileSync(file, 'utf8');

// The user wants `"qrCode": "/images/fitness.png"` added to all profiles.
// Find `contact: { ... }` and add `qrCode: '/images/fitness.png'` after it.
// Need to handle both `contact: { ... }` and `"contact": { ... }`.

// Replace any existing qrCode first to clean up
data = data.replace(/,\s*"?qrCode"?:\s*['"][^'"]+['"]/g, '');

// Now add it back after contact
data = data.replace(/("?contact"?:\s*\{[^}]*\})(\s*,?)/g, (match, p1, p2) => {
    return p1 + ",\n      qrCode: '/images/fitness.png'" + (p2.includes(',') ? ',' : '');
});

fs.writeFileSync(file, data);
console.log('Done');
