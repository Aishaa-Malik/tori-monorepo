const fs = require('fs');

const file = '/Users/aisha/tori-monorepo/toriate-monorepo/apps/doubtfearcopy/frontend/src/data/services.ts';
let data = fs.readFileSync(file, 'utf8');

// Replace contact: { ... }, with contact: { ... }, qrCode: '/images/yello.png',
// where qrCode is not already present.
data = data.replace(/(contact:\s*\{[^}]*\})(\s*,)/g, (match, p1, p2) => {
    return p1 + p2 + "\n      qrCode: '/images/yello.png',";
});

// For some items it might be contact: { ... } without a comma at the end, but usually there's a comma or newline.
data = data.replace(/(contact:\s*\{[^}]*\})(\n)/g, (match, p1, p2) => {
    if (match.includes('qrCode')) return match;
    return p1 + ",\n      qrCode: '/images/yello.png'," + p2;
});

// Remove duplicate qrCodes if any
data = data.replace(/qrCode:\s*'\/images\/yello\.png',\s*qrCode:\s*'\/images\/yello\.png',/g, "qrCode: '/images/yello.png',");

fs.writeFileSync(file, data);
console.log('Done');
