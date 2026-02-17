const fs   = require('fs');
const path = require('path');

// ── Simple frontmatter parser (no dependencies needed) ──────────────
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const data = {};
    match[1].split('\n').forEach(line => {
        const ci = line.indexOf(':');
        if (ci === -1) return;
        const key = line.substring(0, ci).trim();
        let val    = line.substring(ci + 1).trim().replace(/^["']|["']$/g, '');
        if (val !== '' && !isNaN(val)) val = Number(val);
        data[key] = val;
    });
    return data;
}

function readFolder(folderPath) {
    if (!fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.md') && f !== '.gitkeep')
        .map(f => {
            const raw  = fs.readFileSync(path.join(folderPath, f), 'utf8');
            const data = parseFrontmatter(raw);
            data.id    = f.replace('.md', '');
            return data;
        });
}

function readSettings() {
    const p = './_data/settings.json';
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    return {
        deviceQuestion:  'What device are you using?',
        offerDescription:'Complete this offer to unlock your item',
        offerButtonText: 'Complete Offer',
        timerDuration:   40,
        unlockTitle:     'Content unlocked!',
        rewardLabel:     'Your Reward',
        rewardButtonName:'Get Your Reward',
        rewardButtonLink:'https://example.com/reward'
    };
}

// ── Build ────────────────────────────────────────────────────────────
const outDir = './_build';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const items    = readFolder('./_items');
const devices  = readFolder('./_devices');
const settings = readSettings();

fs.writeFileSync(path.join(outDir, 'items.json'),    JSON.stringify(items,    null, 2));
fs.writeFileSync(path.join(outDir, 'devices.json'),  JSON.stringify(devices,  null, 2));
fs.writeFileSync(path.join(outDir, 'settings.json'), JSON.stringify(settings, null, 2));

console.log(`✅ Built ${items.length} items, ${devices.length} devices`);
console.log('🎉 Build complete!');
