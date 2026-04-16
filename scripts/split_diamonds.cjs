/**
 * Splits diamonds.json into per-shape files for efficient server-side pagination.
 * Run after fetch_diamonds.cjs to keep shape files in sync.
 *
 * Output files: public/data/diamonds-{shape}.json (e.g. diamonds-round.json)
 */

const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '../public/data/diamonds.json');
const OUT_DIR = path.join(__dirname, '../public/data');

function main() {
    if (!fs.existsSync(SOURCE)) {
        console.error('diamonds.json not found at', SOURCE);
        process.exit(1);
    }

    console.log('Reading diamonds.json...');
    const all = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
    console.log(`Loaded ${all.length} diamonds.`);

    // Group by shape (lowercase)
    const byShape = {};
    for (const d of all) {
        const shape = (d.Shape || 'unknown').toLowerCase();
        if (!byShape[shape]) byShape[shape] = [];
        byShape[shape].push(d);
    }

    // Write per-shape files
    for (const [shape, diamonds] of Object.entries(byShape)) {
        const outPath = path.join(OUT_DIR, `diamonds-${shape}.json`);
        fs.writeFileSync(outPath, JSON.stringify(diamonds));
        console.log(`  Written: diamonds-${shape}.json (${diamonds.length} diamonds)`);
    }

    console.log(`\nDone. ${Object.keys(byShape).length} shape files written.`);
}

main();
