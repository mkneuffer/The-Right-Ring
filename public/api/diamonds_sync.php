<?php
/**
 * GET /api/diamonds_sync.php
 *
 * Returns the status of the most recent diamond sync run and total counts
 * by type. Useful for monitoring and Railway health checks.
 *
 * Response shape:
 * {
 *   "last_sync": {
 *     "status": "success" | "failed" | "partial" | "running",
 *     "started_at": "<ISO8601>",
 *     "finished_at": "<ISO8601>" | null,
 *     "natural_count": 12345,
 *     "lab_count": 6789,
 *     "error_message": null | "…"
 *   },
 *   "db_totals": {
 *     "natural": 12345,
 *     "lab": 6789,
 *     "total": 19134
 *   }
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

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

try {
    // Most recent sync log entry
    $sync_stmt = $pdo->query("
        SELECT status, started_at, finished_at, natural_count, lab_count, error_message
        FROM diamond_sync_log
        ORDER BY id DESC
        LIMIT 1
    ");
    $last_sync = $sync_stmt->fetch() ?: null;

    // Live counts from diamonds table
    $count_stmt = $pdo->query("
        SELECT
            COUNT(*) FILTER (WHERE diamond_type = 'Natural Diamond') AS natural,
            COUNT(*) FILTER (WHERE diamond_type = 'Lab Grown')       AS lab,
            COUNT(*)                                                  AS total
        FROM diamonds
    ");
    $counts = $count_stmt->fetch();

    echo json_encode([
        'last_sync' => $last_sync,
        'db_totals' => [
            'natural' => (int)$counts['natural'],
            'lab'     => (int)$counts['lab'],
            'total'   => (int)$counts['total'],
        ],
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
}
