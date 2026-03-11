const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DIAMONDS_PATH = path.join(__dirname, '../public/data/diamonds.json');
const API_KEY = process.env.VITE_DIAMOND_API_KEY;

// SETTINGS
const FAST_DELAY = 10 * 1000;         // 1 minute (Trial speed)
const RECOVERY_DELAY = 15.5 * 60 * 1000; // 15.5 mins (Fallback if blocked)

if (!API_KEY) {
    console.error('Error: VITE_DIAMOND_API_KEY is not defined in .env');
    process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function fetchJson(url) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
    };
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } 
                catch (e) { reject(new Error(`JSON Parse Error: ${e.message}`)); }
            });
        }).on('error', reject);
    });
}

async function fetchAllPages(type, label) {
    let allData = [];
    let currentPage = 1;
    let totalPages = 1;

    console.log(`\n--- Starting ${label} Sync ---`);

    while (currentPage <= totalPages) {
        const url = `https://belgiumdia.com/api/developer-api/diamond?type=${type}&page=${currentPage}&key=${API_KEY}`;
        console.log(`[${new Date().toLocaleTimeString()}] Requesting ${label} Page ${currentPage}...`);
        
        try {
            const response = await fetchJson(url);

            if (response && response.data && Array.isArray(response.data)) {
                const mapped = response.data.map(d => ({ ...d, Diamond_Type: label }));
                allData = [...allData, ...mapped];
                
                if (currentPage === 1) {
                    totalPages = response.total_page || 1;
                    console.log(`Confirmed: ${label} has ${totalPages} total pages.`);
                }

                console.log(`Success: Received ${response.data.length} items from Page ${currentPage}.`);

                if (currentPage < totalPages) {
                    console.log(`Waiting 60s for next page...`);
                    await sleep(FAST_DELAY);
                }
                currentPage++; // Move to next page
            } else if (response.message && response.message.includes("limit reached")) {
                console.warn(`[!!] Hit Rate Limit. Entering recovery mode. Waiting 15.5 mins...`);
                await sleep(RECOVERY_DELAY);
                // DO NOT increment currentPage; we want to retry this same page
            } else {
                console.error(`API Error on Page ${currentPage}: ${response.message || 'No data'}`);
                break; 
            }
        } catch (error) {
            console.error(`Network Error on Page ${currentPage}:`, error.message);
            break;
        }
    }
    return allData;
}

async function main() {
    console.log(`[${new Date().toLocaleString()}] Inventory Update Initialized.`);

    const natural = await fetchAllPages('natural', 'Natural Diamond');
    
    console.log('\nNatural sync finished. Brief 60s cooldown...');
    await sleep(FAST_DELAY);

    const lab = await fetchAllPages('lab', 'Lab Grown');

    // Load fallbacks
    let existingData = [];
    if (fs.existsSync(DIAMONDS_PATH)) {
        existingData = JSON.parse(fs.readFileSync(DIAMONDS_PATH, 'utf8'));
    }

    const finalNatural = (natural && natural.length > 0) ? natural : existingData.filter(d => d.Diamond_Type === 'Natural Diamond');
    const finalLab = (lab && lab.length > 0) ? lab : existingData.filter(d => d.Diamond_Type === 'Lab Grown');

    const combined = [...finalNatural, ...finalLab];

    if (combined.length > 0) {
        fs.writeFileSync(DIAMONDS_PATH, JSON.stringify(combined, null, 2));
        console.log(`\n--- Update Complete ---`);
        console.log(`Total: ${combined.length} items saved.`);
    }
}

main();