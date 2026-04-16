/**
 * fetch_diamonds.cjs
 *
 * Nightly cron script (3 AM UTC) that syncs the Belgium Diamond API into
 * the Postgres `diamonds` table via upsert. Requires DATABASE_URL and
 * VITE_DIAMOND_API_KEY in the environment.
 *
 * Usage:  node scripts/fetch_diamonds.cjs
 * Logs:   /var/log/cron_fetch.log (via cron redirect)
 */

'use strict';

const https      = require('https');
const path       = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ── Config ────────────────────────────────────────────────────────────────────
const API_KEY      = process.env.VITE_DIAMOND_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const PAGE_DELAY_MS   = 10_000;           // 10 s between pages (trial tier)
const RATE_LIMIT_WAIT = 15.5 * 60_000;   // 15.5 min recovery if rate-limited
const COOLDOWN_MS     = 10_000;           // 10 s between natural/lab runs
const BATCH_SIZE      = 200;              // rows per upsert statement

if (!API_KEY) {
    console.error('[FATAL] VITE_DIAMOND_API_KEY is not set.');
    process.exit(1);
}
if (!DATABASE_URL) {
    console.error('[FATAL] DATABASE_URL is not set.');
    process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const ts    = () => new Date().toLocaleTimeString('en-US', { hour12: false });

function fetchJson(url) {
    const opts = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TheRightRing/1.0)',
            'Accept':     'application/json',
        },
    };
    return new Promise((resolve, reject) => {
        https.get(url, opts, (res) => {
            let raw = '';
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                try   { resolve(JSON.parse(raw)); }
                catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
            });
        }).on('error', reject);
    });
}

/** Fetch every page for one diamond type; tag each row with Diamond_Type. */
async function fetchAllPages(apiType, label) {
    const diamonds = [];
    let page       = 1;
    let totalPages = 1;

    console.log(`\n[${ts()}] ── Starting ${label} fetch ──`);

    while (page <= totalPages) {
        const url = `https://belgiumdia.com/api/developer-api/diamond?type=${apiType}&page=${page}&key=${API_KEY}`;
        console.log(`[${ts()}] GET ${label} page ${page}/${totalPages}`);

        try {
            const res = await fetchJson(url);

            if (res?.data && Array.isArray(res.data)) {
                if (page === 1) {
                    totalPages = res.total_page || 1;
                    console.log(`[${ts()}] ${label}: ${totalPages} total pages`);
                }

                for (const row of res.data) {
                    row.Diamond_Type = label;
                    diamonds.push(row);
                }

                console.log(`[${ts()}] Page ${page}: +${res.data.length} (running total: ${diamonds.length})`);
                if (page < totalPages) await sleep(PAGE_DELAY_MS);
                page++;

            } else if (typeof res?.message === 'string' && res.message.includes('limit reached')) {
                console.warn(`[${ts()}] Rate-limited — waiting ${RATE_LIMIT_WAIT / 60_000} min…`);
                await sleep(RATE_LIMIT_WAIT);
                // do NOT increment page — retry same page

            } else {
                console.error(`[${ts()}] Unexpected response on page ${page}:`, JSON.stringify(res).slice(0, 300));
                break;
            }
        } catch (err) {
            console.error(`[${ts()}] Network error on page ${page}:`, err.message);
            break;
        }
    }

    console.log(`[${ts()}] ${label} done: ${diamonds.length} stones`);
    return diamonds;
}

/** Map a raw API row to the diamonds table columns. */
function mapRow(d) {
    return {
        stock_no:               String(d.Stock_No               ?? '').trim(),
        availability:           String(d.Availability            ?? '').trim().toUpperCase(),
        shape:                  String(d.Shape                   ?? '').trim().toLowerCase(),
        weight:                 parseFloat(d.Weight)             || 0,
        color:                  String(d.Color                   ?? '').trim(),
        clarity:                String(d.Clarity                 ?? '').trim(),
        cut_grade:              String(d.Cut_Grade               ?? '').trim(),
        polish:                 String(d.Polish                  ?? '').trim(),
        symmetry:               String(d.Symmetry                ?? '').trim(),
        fluorescence_intensity: String(d.Fluorescence_Intensity  ?? '').trim(),
        fluorescence_color:     String(d.Fluorescence_Color      ?? '').trim(),
        measurements:           String(d.Measurements            ?? '').trim(),
        lab:                    String(d.Lab                     ?? '').trim(),
        rap_price:              parseFloat(d.Rap_Price)          || 0,
        cod_buy_price:          d.COD_Buy_Price != null ? (parseFloat(d.COD_Buy_Price) || null) : null,
        diamond_type:           String(d.Diamond_Type            ?? '').trim(),
        image_link:             String(d.ImageLink               ?? '').trim(),
        video_link:             String(d.VideoLink               ?? '').trim(),
        video_html:             String(d.Video_HTML              ?? '').trim(),
        certificate_link:       String(d.CertificateLink         ?? '').trim(),
    };
}

const COLS = [
    'stock_no', 'availability', 'shape', 'weight', 'color', 'clarity',
    'cut_grade', 'polish', 'symmetry', 'fluorescence_intensity',
    'fluorescence_color', 'measurements', 'lab', 'rap_price',
    'cod_buy_price', 'diamond_type', 'image_link', 'video_link',
    'video_html', 'certificate_link', 'fetched_at',
];

const UPDATE_SET = COLS
    .filter((c) => c !== 'stock_no')
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(', ');

/** Upsert a batch of mapped rows in one multi-row INSERT … ON CONFLICT statement. */
async function upsertBatch(client, rows) {
    if (rows.length === 0) return;

    const values = [];
    const params = [];
    let   idx    = 1;
    const now    = new Date();

    for (const row of rows) {
        const placeholders = COLS.map(() => `$${idx++}`);
        values.push(`(${placeholders.join(', ')})`);
        params.push(
            row.stock_no, row.availability, row.shape, row.weight,
            row.color, row.clarity, row.cut_grade, row.polish,
            row.symmetry, row.fluorescence_intensity, row.fluorescence_color,
            row.measurements, row.lab, row.rap_price, row.cod_buy_price,
            row.diamond_type, row.image_link, row.video_link,
            row.video_html, row.certificate_link, now,
        );
    }

    await client.query(
        `INSERT INTO diamonds (${COLS.join(', ')})
         VALUES ${values.join(', ')}
         ON CONFLICT (stock_no) DO UPDATE SET ${UPDATE_SET}`,
        params,
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const startedAt = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${ts()}] Diamond inventory sync started`);
    console.log('='.repeat(60));

    const db = new Client({ connectionString: DATABASE_URL });
    await db.connect();

    const { rows: [{ id: syncLogId }] } = await db.query(
        `INSERT INTO diamond_sync_log (started_at, status) VALUES ($1, 'running') RETURNING id`,
        [startedAt],
    );

    let naturalCount = 0;
    let labCount     = 0;

    try {
        // ── Fetch ─────────────────────────────────────────────────────────────
        const naturalRaw = await fetchAllPages('natural', 'Natural Diamond');
        console.log(`\n[${ts()}] Cooldown ${COOLDOWN_MS / 1000}s before lab fetch…`);
        await sleep(COOLDOWN_MS);
        const labRaw = await fetchAllPages('lab', 'Lab Grown');

        const allRaw = [...naturalRaw, ...labRaw];
        if (allRaw.length === 0) {
            throw new Error('API returned 0 diamonds — aborting to preserve existing data');
        }

        // ── Map + deduplicate ─────────────────────────────────────────────────
        const seen = new Map();
        for (const r of allRaw.map(mapRow)) {
            if (r.stock_no) seen.set(r.stock_no, r);
        }
        const deduped = [...seen.values()];
        console.log(`\n[${ts()}] Upserting ${deduped.length} diamonds (${allRaw.length - deduped.length} dupes removed)…`);

        // ── Upsert in batches ─────────────────────────────────────────────────
        for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
            await upsertBatch(db, deduped.slice(i, i + BATCH_SIZE));
            process.stdout.write(`\r[${ts()}] Upserted ${Math.min(i + BATCH_SIZE, deduped.length)}/${deduped.length}`);
        }
        console.log();

        // ── Prune rows not seen this run ──────────────────────────────────────
        const { rowCount: pruned } = await db.query(
            'DELETE FROM diamonds WHERE fetched_at < $1',
            [startedAt],
        );
        if (pruned > 0) console.log(`[${ts()}] Pruned ${pruned} stale diamonds`);

        // ── Final counts ──────────────────────────────────────────────────────
        const { rows: counts } = await db.query(
            `SELECT diamond_type, COUNT(*) AS n FROM diamonds GROUP BY diamond_type`,
        );
        for (const row of counts) {
            const n = parseInt(row.n, 10);
            console.log(`[${ts()}] DB total — ${row.diamond_type}: ${n}`);
            if (row.diamond_type === 'Natural Diamond') naturalCount = n;
            if (row.diamond_type === 'Lab Grown')       labCount     = n;
        }

        await db.query(
            `UPDATE diamond_sync_log
                SET status = 'success', finished_at = now(),
                    natural_count = $1, lab_count = $2
              WHERE id = $3`,
            [naturalCount, labCount, syncLogId],
        );

        console.log(`\n[${ts()}] ✓ Sync complete — ${naturalCount} natural, ${labCount} lab grown`);

    } catch (err) {
        console.error(`\n[${ts()}] SYNC FAILED:`, err.message);
        await db.query(
            `UPDATE diamond_sync_log
                SET status = 'failed', finished_at = now(), error_message = $1
              WHERE id = $2`,
            [err.message, syncLogId],
        );
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

main();
