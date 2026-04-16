<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ── Constants mirroring DiamondSelector.tsx ─────────────────────────────────
const COLORS     = ['D', 'E', 'F', 'G', 'H'];
const CLARITIES  = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1'];
const CUT_GRADES = ['EX', 'VG', 'G', 'F', 'P'];
const POLISH_SYM = ['EX', 'VG', 'G', 'F', 'P'];

// ── Input params ─────────────────────────────────────────────────────────────
$shape     = strtolower(trim($_GET['shape'] ?? 'round'));
$type      = $_GET['type']      ?? 'natural';   // natural | lab | all
$page      = max(1, (int)($_GET['page']  ?? 1));
$limit     = min(100, max(1, (int)($_GET['limit'] ?? 20)));

$color_min    = (int)($_GET['color_min']    ?? 0);
$color_max    = (int)($_GET['color_max']    ?? count(COLORS) - 1);
$clarity_min  = (int)($_GET['clarity_min']  ?? 0);
$clarity_max  = (int)($_GET['clarity_max']  ?? count(CLARITIES) - 1);
$cut_min      = (int)($_GET['cut_min']      ?? 0);
$cut_max      = (int)($_GET['cut_max']      ?? count(CUT_GRADES) - 1);
$polish_min   = (int)($_GET['polish_min']   ?? 0);
$polish_max   = (int)($_GET['polish_max']   ?? count(POLISH_SYM) - 1);
$symmetry_min = (int)($_GET['symmetry_min'] ?? 0);
$symmetry_max = (int)($_GET['symmetry_max'] ?? count(POLISH_SYM) - 1);
$price_min    = (float)($_GET['price_min']  ?? 0);
$price_max    = (float)($_GET['price_max']  ?? 58000);
$carat_min    = (float)($_GET['carat_min']  ?? 0.5);
$carat_max    = (float)($_GET['carat_max']  ?? 6.5);

// ── Load data ─────────────────────────────────────────────────────────────────
$data_dir   = __DIR__ . '/../data';
$shape_file = $data_dir . "/diamonds-{$shape}.json";
$fallback   = $data_dir . '/diamonds.json';

$source = file_exists($shape_file) ? $shape_file : $fallback;

if (!file_exists($source)) {
    http_response_code(503);
    echo json_encode(['error' => 'Diamond data not available']);
    exit;
}

$raw = file_get_contents($source);
if ($raw === false) {
    http_response_code(503);
    echo json_encode(['error' => 'Failed to read diamond data']);
    exit;
}

$all = json_decode($raw, true);
if (!is_array($all)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid diamond data format']);
    exit;
}

// ── Price calculation (mirrors utils.ts: calculateDiamondPrice) ───────────────
function calculatePrice(array $d): float {
    $weight = (float)($d['Weight'] ?? 0);

    if (($d['Diamond_Type'] ?? '') === 'Lab Grown' && !empty($d['COD_Buy_Price'])) {
        $cod = (float)$d['COD_Buy_Price'];
        if (is_nan($cod)) return 0;

        $price = $cod * 2;
        if ($weight >= 3.0) {
            if ($cod <= 2000) $price += 1600;
        } elseif ($weight >= 2.5) {
            $price += 1300;
        } elseif ($weight >= 2.0) {
            $price += 1100;
        } elseif ($weight >= 1.5) {
            $price += 900;
        } elseif ($weight >= 1.0) {
            $price += 700;
        } elseif ($weight >= 0.5) {
            $price += 500;
        }
        return $price;
    }

    // Natural
    $rap = (int)($d['Rap_Price'] ?? 0);
    return $rap * $weight;
}

// ── Filter ────────────────────────────────────────────────────────────────────
$filtered = [];

foreach ($all as $d) {
    // Availability
    $avail = strtoupper($d['Availability'] ?? '');
    if ($avail !== 'G' && $avail !== 'M') continue;

    // Shape (only relevant when reading the fallback full file)
    if (!file_exists($shape_file)) {
        if (strtolower($d['Shape'] ?? '') !== $shape) continue;
    }

    // Diamond type — empty/missing type is treated as Natural (matches original JS logic)
    $dtype = $d['Diamond_Type'] ?? '';
    if ($type === 'natural' && $dtype !== 'Natural Diamond' && $dtype !== '') continue;
    if ($type === 'lab'     && $dtype !== 'Lab Grown') continue;

    // Carat
    $weight = (float)($d['Weight'] ?? 0);
    if ($weight < $carat_min || $weight > $carat_max) continue;

    // Color
    $ci = array_search($d['Color'] ?? '', COLORS);
    if ($ci === false) continue;
    if ($ci < $color_min || $ci > $color_max) continue;

    // Clarity
    $cli = array_search($d['Clarity'] ?? '', CLARITIES);
    if ($cli === false) continue;
    if ($cli < $clarity_min || $cli > $clarity_max) continue;

    // Cut / Polish / Symmetry
    if ($shape === 'round') {
        $cuti = array_search($d['Cut_Grade'] ?? '', CUT_GRADES);
        if ($cuti !== false && ($cuti < $cut_min || $cuti > $cut_max)) continue;
    } else {
        $pi = array_search($d['Polish'] ?? '', POLISH_SYM);
        if ($pi !== false && ($pi < $polish_min || $pi > $polish_max)) continue;

        $si = array_search($d['Symmetry'] ?? '', POLISH_SYM);
        if ($si !== false && ($si < $symmetry_min || $si > $symmetry_max)) continue;
    }

    // Price
    $price = calculatePrice($d);
    if ($price < $price_min || $price > $price_max) continue;

    $filtered[] = $d;
}

// ── Paginate ──────────────────────────────────────────────────────────────────
$total  = count($filtered);
$offset = ($page - 1) * $limit;
$page_items = array_slice($filtered, $offset, $limit);

echo json_encode([
    'diamonds' => $page_items,
    'total'    => $total,
    'page'     => $page,
    'hasMore'  => ($offset + $limit) < $total,
]);
