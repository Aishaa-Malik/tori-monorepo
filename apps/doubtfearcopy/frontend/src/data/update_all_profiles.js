const fs = require('fs');

const file = '/Users/aisha/tori-monorepo/toriate-monorepo/apps/doubtfearcopy/frontend/src/data/services.ts';
let data = fs.readFileSync(file, 'utf8');

// The user wants both `bookingLink` and `qrCode` explicitly added to every profile object.
// We can find `contact: { ... }` or `"contact": { ... }` and append these properties after it.

// First, clean up existing qrCode and bookingLink so we don't duplicate
data = data.replace(/,\s*"?qrCode"?:\s*['"][^'"]+['"]/g, '');
data = data.replace(/,\s*"?bookingLink"?:\s*['"][^'"]+['"]/g, '');

// Now add both back after contact
data = data.replace(/("?contact"?:\s*\{[^}]*\})(\s*,?)/g, (match, p1, p2) => {
    return p1 + ",\n      qrCode: '/images/fitness.png',\n      bookingLink: 'https://api.whatsapp.com/send/?phone=919351504729&text=Book++Gym&type=phone_number&app_absent=0'" + (p2.includes(',') ? ',' : '');
});

fs.writeFileSync(file, data);
console.log('Done');
