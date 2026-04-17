<?php
/**
 * GET /api/diamond.php?id=STOCK_NO
 *
 * Fetch a single diamond by Stock_No from Postgres.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = trim($_GET['id'] ?? '');
if ($id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id parameter']);
    exit;
}

$rawDsn = getenv('DATABASE_URL');
if (!$rawDsn) {
    http_response_code(503);
    echo json_encode(['error' => 'Database not configured']);
    exit;
}

$parsed = parse_url($rawDsn);
$dsn    = sprintf('pgsql:host=%s;port=%d;dbname=%s',
    $parsed['host'],
    $parsed['port'] ?? 5432,
    ltrim($parsed['path'] ?? '', '/')
);
$dbUser = $parsed['user'] ?? null;
$dbPass = $parsed['pass'] ?? null;

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

try {
    $stmt = $pdo->prepare("
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
        WHERE stock_no = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $diamond = $stmt->fetch();

    if (!$diamond) {
        http_response_code(404);
        echo json_encode(['error' => 'Diamond not found']);
        exit;
    }

    echo json_encode(['diamond' => $diamond]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
}
