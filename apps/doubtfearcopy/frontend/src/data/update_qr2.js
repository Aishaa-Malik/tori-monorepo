const fs = require('fs');

const file = '/Users/aisha/tori-monorepo/toriate-monorepo/apps/doubtfearcopy/frontend/src/data/services.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/(contact:\s*\{[^}]*\})(\s*,)/g, (match, p1, p2) => {
    return p1 + p2 + "\n      qrCode: '/images/euro fitness.png',";
});

data = data.replace(/(contact:\s*\{[^}]*\})(\n)/g, (match, p1, p2) => {
    if (match.includes('qrCode')) return match;
    return p1 + ",\n      qrCode: '/images/euro fitness.png'," + p2;
});

// Avoid duplicate
data = data.replace(/qrCode:\s*'\/images\/euro fitness\.png',\s*qrCode:\s*'\/images\/euro fitness\.png',/g, "qrCode: '/images/euro fitness.png',");

fs.writeFileSync(file, data);
console.log('Done');
