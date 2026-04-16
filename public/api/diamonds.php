<?php
/**
 * GET /api/diamonds.php
 *
 * Paginated, filtered diamond search backed by Postgres.
 * All filter parameters mirror DiamondSelector.tsx exactly.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ── Ordered lookup tables (index = slider position) ──────────────────────────
const COLORS     = ['D', 'E', 'F', 'G', 'H'];
const CLARITIES  = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1'];
const CUT_GRADES = ['EX', 'VG', 'G', 'F', 'P'];
const POLISH_SYM = ['EX', 'VG', 'G', 'F', 'P'];

// ── Input params ──────────────────────────────────────────────────────────────
$shape = strtolower(trim($_GET['shape'] ?? 'round'));
$type  = $_GET['type'] ?? 'natural';   // natural | lab | all
$page  = max(1, (int)($_GET['page']  ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));

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

// ── DB connection ─────────────────────────────────────────────────────────────
$dsn = getenv('DATABASE_URL');
if (!$dsn) {
    http_response_code(503);
    echo json_encode(['error' => 'Database not configured']);
    exit;
}

try {
    $pdo = new PDO($dsn, null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// ── Build WHERE clauses ───────────────────────────────────────────────────────
$where  = ["availability IN ('G', 'M')", 'shape = :shape'];
$params = [':shape' => $shape];

// Diamond type
if ($type === 'natural') {
    // empty diamond_type treated as natural (matches original JS logic)
    $where[] = "(diamond_type = 'Natural Diamond' OR diamond_type = '')";
} elseif ($type === 'lab') {
    $where[] = "diamond_type = 'Lab Grown'";
}
// 'all' → no type filter

// Carat
$where[]            = 'weight BETWEEN :carat_min AND :carat_max';
$params[':carat_min'] = $carat_min;
$params[':carat_max'] = $carat_max;

// Color — translate slider indexes to value list
$color_vals = array_slice(COLORS, $color_min, $color_max - $color_min + 1);
if (empty($color_vals)) {
    echo json_encode(['diamonds' => [], 'total' => 0, 'page' => $page, 'hasMore' => false]);
    exit;
}
foreach ($color_vals as $i => $v) {
    $params[":color_{$i}"] = $v;
}
$where[] = 'color IN (' . implode(',', array_map(fn($i) => ":color_{$i}", array_keys($color_vals))) . ')';

// Clarity
$clarity_vals = array_slice(CLARITIES, $clarity_min, $clarity_max - $clarity_min + 1);
if (empty($clarity_vals)) {
    echo json_encode(['diamonds' => [], 'total' => 0, 'page' => $page, 'hasMore' => false]);
    exit;
}
foreach ($clarity_vals as $i => $v) {
    $params[":clarity_{$i}"] = $v;
}
$where[] = 'clarity IN (' . implode(',', array_map(fn($i) => ":clarity_{$i}", array_keys($clarity_vals))) . ')';

// Cut (round) / Polish + Symmetry (fancy shapes)
if ($shape === 'round') {
    $cut_vals = array_slice(CUT_GRADES, $cut_min, $cut_max - $cut_min + 1);
    if (!empty($cut_vals)) {
        foreach ($cut_vals as $i => $v) {
            $params[":cut_{$i}"] = $v;
        }
        $where[] = '(cut_grade = \'\' OR cut_grade IN (' . implode(',', array_map(fn($i) => ":cut_{$i}", array_keys($cut_vals))) . '))';
    }
} else {
    $polish_vals = array_slice(POLISH_SYM, $polish_min, $polish_max - $polish_min + 1);
    if (!empty($polish_vals)) {
        foreach ($polish_vals as $i => $v) {
            $params[":pol_{$i}"] = $v;
        }
        $where[] = '(polish = \'\' OR polish IN (' . implode(',', array_map(fn($i) => ":pol_{$i}", array_keys($polish_vals))) . '))';
    }

    $sym_vals = array_slice(POLISH_SYM, $symmetry_min, $symmetry_max - $symmetry_min + 1);
    if (!empty($sym_vals)) {
        foreach ($sym_vals as $i => $v) {
            $params[":sym_{$i}"] = $v;
        }
        $where[] = '(symmetry = \'\' OR symmetry IN (' . implode(',', array_map(fn($i) => ":sym_{$i}", array_keys($sym_vals))) . '))';
    }
}

// ── Price expression (mirrors utils.ts calculateDiamondPrice exactly) ─────────
// Lab Grown:  cod_buy_price * 2 + tier markup
// Natural:    rap_price * weight
$price_expr = "
    CASE
        WHEN diamond_type = 'Lab Grown' AND cod_buy_price IS NOT NULL THEN
            (cod_buy_price * 2) + CASE
                WHEN weight >= 3.0 AND cod_buy_price <= 2000 THEN 1600
                WHEN weight >= 3.0                           THEN 0
                WHEN weight >= 2.5 THEN 1300
                WHEN weight >= 2.0 THEN 1100
                WHEN weight >= 1.5 THEN  900
                WHEN weight >= 1.0 THEN  700
                WHEN weight >= 0.5 THEN  500
                ELSE 0
            END
        ELSE rap_price * weight
    END";

$where[]              = "({$price_expr}) BETWEEN :price_min AND :price_max";
$params[':price_min']  = $price_min;
$params[':price_max']  = $price_max;

// ── Assemble SQL ──────────────────────────────────────────────────────────────
$where_sql = implode(' AND ', $where);

$count_sql = "SELECT COUNT(*) FROM diamonds WHERE {$where_sql}";

// Column aliases match the Diamond TypeScript interface (PascalCase / camelCase)
$data_sql = "
    SELECT
        stock_no               AS \"Stock_No\",
        availability           AS \"Availability\",
        shape                  AS \"Shape\",
        weight::TEXT           AS \"Weight\",
        color                  AS \"Color\",
        clarity                AS \"Clarity\",
        cut_grade              AS \"Cut_Grade\",
        polish                 AS \"Polish\",
        symmetry               AS \"Symmetry\",
        fluorescence_intensity AS \"Fluorescence_Intensity\",
        fluorescence_color     AS \"Fluorescence_Color\",
        measurements           AS \"Measurements\",
        lab                    AS \"Lab\",
        rap_price::TEXT        AS \"Rap_Price\",
        cod_buy_price::TEXT    AS \"COD_Buy_Price\",
        diamond_type           AS \"Diamond_Type\",
        image_link             AS \"ImageLink\",
        video_link             AS \"VideoLink\",
        video_html             AS \"Video_HTML\",
        certificate_link       AS \"CertificateLink\"
    FROM diamonds
    WHERE {$where_sql}
    ORDER BY weight ASC, ({$price_expr}) ASC
    LIMIT :limit OFFSET :offset
";

try {
    // COUNT (no :limit / :offset)
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total = (int)$count_stmt->fetchColumn();

    // DATA
    $data_stmt = $pdo->prepare($data_sql);
    foreach ($params as $key => $val) {
        $data_stmt->bindValue($key, $val);
    }
    $data_stmt->bindValue(':limit',  $limit,               PDO::PARAM_INT);
    $data_stmt->bindValue(':offset', ($page - 1) * $limit, PDO::PARAM_INT);
    $data_stmt->execute();
    $diamonds = $data_stmt->fetchAll();

    echo json_encode([
        'diamonds' => $diamonds,
        'total'    => $total,
        'page'     => $page,
        'hasMore'  => (($page - 1) * $limit + count($diamonds)) < $total,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
}
