
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DIAMONDS_PATH = path.join(__dirname, '../public/data/diamonds.json');
// Use VITE_DIAMOND_API_KEY from env
const API_KEY = process.env.VITE_DIAMOND_API_KEY;
if (!API_KEY) {
    console.error('Error: VITE_DIAMOND_API_KEY is not defined in .env');
    process.exit(1);
}

const NATURAL_API_URL = `https://belgiumdia.com/api/developer-api/diamond?type=natural&page=1&key=${API_KEY}`;
const LAB_API_URL = `https://belgiumdia.com/api/developer-api/diamond?type=lab&page=1&key=${API_KEY}`;

// Helper to fetch JSON from URL
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function loadLocalDiamonds() {
    if (fs.existsSync(DIAMONDS_PATH)) {
        try {
            const fileContent = fs.readFileSync(DIAMONDS_PATH, 'utf8');
            return JSON.parse(fileContent);
        } catch (e) {
            console.error('Error reading local file:', e);
            return [];
        }
    }
    return [];
}

async function main() {
    console.log('Starting diamond data update (Natural + Lab)...');

    // Load existing data first for fallback reference
    const existingData = loadLocalDiamonds();
    console.log(`Current local inventory: ${existingData.length} items.`);

    // 1. Fetch Natural diamonds
    let naturalDiamonds = [];
    try {
        console.log(`Fetching Natural diamonds from: ${NATURAL_API_URL}`);
        const response = await fetchJson(NATURAL_API_URL);

        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            naturalDiamonds = response.data.map(d => ({
                ...d,
                Diamond_Type: 'Natural Diamond'
            }));
            console.log(`Fetched ${naturalDiamonds.length} Natural diamonds from API.`);
        } else {
            console.warn('Natural API response empty or rate limited. Using existing cached Natural diamonds.');
            if (response.message) console.log('API Message:', response.message);

            // Fallback: Use existing Natural diamonds
            naturalDiamonds = existingData.filter(d => (!d.Diamond_Type || d.Diamond_Type === 'Natural Diamond') && d.Diamond_Type !== 'Lab Grown');
            console.log(`Fallback: Kept ${naturalDiamonds.length} Natural diamonds from local file.`);
        }
    } catch (e) {
        console.error('Error fetching Natural diamonds:', e);
        // Fallback
        naturalDiamonds = existingData.filter(d => (!d.Diamond_Type || d.Diamond_Type === 'Natural Diamond') && d.Diamond_Type !== 'Lab Grown');
        console.log(`Fallback (Error): Kept ${naturalDiamonds.length} Natural diamonds from local file.`);
    }

    // 2. Fetch Lab diamonds
    let labDiamonds = [];
    try {
        console.log(`Fetching Lab diamonds from: ${LAB_API_URL}`);
        const response = await fetchJson(LAB_API_URL);

        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            labDiamonds = response.data.map(d => ({
                ...d,
                Diamond_Type: 'Lab Grown'
            }));
            console.log(`Fetched ${labDiamonds.length} Lab diamonds from API.`);
        } else {
            console.warn('Lab API response empty or rate limited.');
            if (response.message) console.log('API Message:', response.message);

            // Fallback: Use existing Lab diamonds if we have any? 
            // Or maybe we want to keep them if API fails?
            const existingLab = existingData.filter(d => d.Diamond_Type === 'Lab Grown');
            if (existingLab.length > 0) {
                labDiamonds = existingLab;
                console.log(`Fallback: Kept ${labDiamonds.length} Lab diamonds from local file.`);
            }
        }

    } catch (e) {
        console.error('Error fetching Lab diamonds:', e);
        const existingLab = existingData.filter(d => d.Diamond_Type === 'Lab Grown');
        if (existingLab.length > 0) {
            labDiamonds = existingLab;
            console.log(`Fallback (Error): Kept ${labDiamonds.length} Lab diamonds from local file.`);
        }
    }

    // 3. Merge and Write
    const combinedDiamonds = [...naturalDiamonds, ...labDiamonds];

    if (combinedDiamonds.length === 0) {
        console.error('CRITICAL: No diamonds found (API failed and no local data). Aborting write to prevent data loss.');
        return;
    }

    console.log(`Reference: Total Natural: ${naturalDiamonds.length}, Total Lab: ${labDiamonds.length}`);
    console.log(`Writing ${combinedDiamonds.length} total diamonds to ${DIAMONDS_PATH}...`);

    try {
        fs.writeFileSync(DIAMONDS_PATH, JSON.stringify(combinedDiamonds, null, 2));
        console.log('Success! diamonds.json updated.');
    } catch (e) {
        console.error('Error writing to file:', e);
    }
}

main();
